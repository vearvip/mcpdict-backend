import { Database } from "bun:sqlite";
import { statSync } from "node:fs";

export interface TableCounts {
  langs: number;
  mcpdict: number;
  info: number;
}

export interface DbMeta {
  schemaVersion: number;
  path: string;
  size: number;
  tables: TableCounts;
  visibleDialects: number;
  checkedAt: string;
}

export class DatabaseValidationError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super([message, ...details].join("\n"));
    this.name = "DatabaseValidationError";
    this.details = details;
  }
}

const REQUIRED_TABLES = ["langs", "mcpdict", "info"] as const;

const REQUIRED_COLUMNS: Record<(typeof REQUIRED_TABLES)[number], string[]> = {
  langs: ["字組", "語言", "讀音", "註釋"],
  mcpdict: ["漢字", "異體字"],
  info: ["語言", "簡稱", "聲調", "音典顏色"],
};

function quoteIdent(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function tableExists(db: Database, table: string): boolean {
  const row = db
    .query(
      "SELECT 1 AS ok FROM sqlite_master WHERE type IN ('table', 'view') AND name = ? LIMIT 1",
    )
    .get(table) as { ok?: number } | null;
  return row?.ok === 1;
}

function getColumnNames(db: Database, table: string): string[] {
  // FTS5 虚表通常支持 PRAGMA table_info；如果不支持，用 SELECT ... LIMIT 1 兜底。
  try {
    const rows = db
      .query(`PRAGMA table_info(${quoteIdent(table)})`)
      .all() as Array<{ name?: string }>;
    if (rows.length > 0 && rows.every((row) => typeof row.name === "string")) {
      return rows.map((row) => row.name as string);
    }
  } catch {
    // ignore and fall back
  }

  const rows = db
    .query(`SELECT * FROM ${quoteIdent(table)} LIMIT 1`)
    .all() as Array<Record<string, unknown>>;
  if (rows.length > 0) return Object.keys(rows[0]);

  throw new DatabaseValidationError(`无法读取表结构: ${table}`);
}

function getCount(db: Database, table: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS c FROM ${quoteIdent(table)}`)
    .get() as { c?: number } | null;
  return Number(row?.c ?? 0);
}

export function validateDatabase(
  db: Database,
  path: string,
  options: { quickCheck?: boolean } = {},
): DbMeta {
  const errors: string[] = [];

  if (!tableExists(db, "langs")) errors.push("缺少表: langs");
  if (!tableExists(db, "mcpdict")) errors.push("缺少表: mcpdict");
  if (!tableExists(db, "info")) errors.push("缺少表: info");

  if (errors.length > 0) {
    throw new DatabaseValidationError("数据库结构不完整", errors);
  }

  for (const table of REQUIRED_TABLES) {
    const columns = getColumnNames(db, table);
    const missing = REQUIRED_COLUMNS[table].filter(
      (column) => !columns.includes(column),
    );
    if (missing.length > 0) {
      errors.push(`表 ${table} 缺少列: ${missing.join(", ")}`);
    }
  }

  if (options.quickCheck ?? true) {
    const quickCheck = db.query("PRAGMA quick_check").get() as
      | { quick_check?: string }
      | null;
    if (quickCheck?.quick_check !== "ok") {
      errors.push(`quick_check 未通过: ${quickCheck?.quick_check ?? "unknown"}`);
    }
  }

  const tables: TableCounts = {
    langs: getCount(db, "langs"),
    mcpdict: getCount(db, "mcpdict"),
    info: getCount(db, "info"),
  };

  for (const [table, count] of Object.entries(tables)) {
    if (count <= 0) errors.push(`表 ${table} 为空`);
  }

  const visibleRow = db
    .query(
      `SELECT COUNT(*) AS c FROM ${quoteIdent("info")}
       WHERE ${quoteIdent("音典顏色")} IS NOT NULL
         AND ${quoteIdent("音典顏色")} != ''`,
    )
    .get() as { c?: number } | null;
  const visibleDialects = Number(visibleRow?.c ?? 0);
  if (visibleDialects <= 0) {
    errors.push("info 表没有可用的方言点（音典顏色 全为空）");
  }

  if (errors.length > 0) {
    throw new DatabaseValidationError("数据库校验失败", errors);
  }

  return {
    schemaVersion: Number(process.env.MCPDICT_SCHEMA_VERSION ?? 1),
    path,
    size: statSync(path).size,
    tables,
    visibleDialects,
    checkedAt: new Date().toISOString(),
  };
}

export function openDatabaseWithMeta(
  path: string,
  options: { readonly?: boolean; quickCheck?: boolean } = {},
): { db: Database; meta: DbMeta } {
  const readonly = options.readonly ?? true;
  const db = new Database(path, { readonly });
  if (readonly) {
    db.exec("PRAGMA query_only = ON;");
  }
  return {
    db,
    meta: validateDatabase(db, path, { quickCheck: options.quickCheck }),
  };
}

export function openDatabase(
  path: string,
  options: { readonly?: boolean; quickCheck?: boolean } = {},
): Database {
  return openDatabaseWithMeta(path, options).db;
}
