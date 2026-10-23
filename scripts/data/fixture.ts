import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { openDatabaseWithMeta } from "../../src/database/open";
import { DEFAULT_DB_PATH, FIXTURE_PATH, ROOT } from "./paths";
import { formatBytes } from "./hash";

const SAMPLE_DIALECTS = [
  "廣韻",
  "臺灣",
  "蘇州",
  "北京",
  "廣州",
  "上海",
  "福州",
  "南昌",
  "長沙",
  "成都",
  "梅縣",
  "溫州",
];

const SAMPLE_CHARS = ["說", "明", "漢", "字", "音", "典", "方", "言", "查", "詢"];
const LANGS_PER_DIALECT = 300;
const LANGS_BY_CHAR_LIMIT = 500;

function parseArgs(argv: string[]): { db: string; out: string } {
  const get = (name: string, fallback: string): string => {
    const index = argv.indexOf(`--${name}`);
    return resolve(index >= 0 ? argv[index + 1] : fallback);
  };
  const fallbackDb = existsSync(DEFAULT_DB_PATH)
    ? DEFAULT_DB_PATH
    : resolve(ROOT, "src/database/mcpdict.db");
  return { db: get("db", fallbackDb), out: get("out", FIXTURE_PATH) };
}

function schemaFor(db: Database, table: string): string {
  const row = db
    .query("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table) as { sql?: string } | null;
  if (!row?.sql) throw new Error(`源数据库缺少表结构: ${table}`);
  return row.sql;
}

function columnNames(db: Database, table: string): string[] {
  return (db.query(`PRAGMA table_info("${table}")`).all() as Array<{
    name: string;
  }>).map((row) => row.name);
}

function insertRows(
  target: Database,
  table: string,
  columns: string[],
  rows: Array<Record<string, unknown>>,
): number {
  if (rows.length === 0) return 0;
  const quoted = columns.map((column) => `"${column.replaceAll('"', '""')}"`);
  const statement = target.prepare(
    `INSERT INTO "${table}" (${quoted.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
  );
  target.transaction(() => {
    for (const row of rows) {
      statement.run(...(columns.map((column) => row[column] ?? null) as any[]));
    }
  })();
  return rows.length;
}

function main(): void {
  const { db: sourcePath, out } = parseArgs(process.argv.slice(2));
  if (!existsSync(sourcePath)) {
    throw new Error(`源数据库不存在: ${sourcePath}（先运行 bun run data:fetch）`);
  }

  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });

  const source = openDatabaseWithMeta(sourcePath).db;
  const target = new Database(out, { create: true, readonly: false });
  target.exec(`
    PRAGMA journal_mode = OFF;
    PRAGMA synchronous = OFF;
    PRAGMA temp_store = MEMORY;
  `);

  try {
    for (const table of ["langs", "mcpdict", "info"]) {
      target.exec(schemaFor(source, table));
    }

    // info 只有几千行，直接全量读出来按简称过滤，避免依赖 FTS5 的 IN 语义。
    const allInfo = source.query("SELECT * FROM info").all() as Array<
      Record<string, unknown>
    >;
    const sampleInfo = allInfo.filter((row) =>
      SAMPLE_DIALECTS.includes(String(row["簡稱"])),
    );

    const dialectMatch = SAMPLE_DIALECTS.map((name) => `"${name}"`).join(" OR ");
    const baseCharMatch = SAMPLE_CHARS.map((char) => `"${char}"`).join(" OR ");

    // 先查样本字的字典行，把它们在“異體字”里列出的异体也加进样本字集合。
    // 例如“說”在字表中实际写作“説”，只查“說”会漏掉。
    const sampleDictRows = source
      .query(`SELECT * FROM mcpdict WHERE mcpdict MATCH ? LIMIT 200`)
      .all(`漢字 : (${baseCharMatch})`) as Array<Record<string, unknown>>;
    const allChars = new Set(SAMPLE_CHARS);
    for (const row of sampleDictRows) {
      for (const variant of String(row["異體字"] ?? "").split(/\s+/)) {
        if (variant) allChars.add(variant);
      }
    }
    const charMatch = [...allChars]
      .slice(0, 200)
      .map((char) => `"${char}"`)
      .join(" OR ");

    // 同时取“样本方言的一段”和“样本字的全部读音”，保证 fixture 里既能测方言树，
    // 也能对 說/明/漢 等字跑出真实结果。
    const languageRows = new Map<number, Record<string, unknown>>();
    for (const name of SAMPLE_DIALECTS) {
      const rows = source
        .query(`SELECT rowid AS _rowid, * FROM langs WHERE langs MATCH ? LIMIT ?`)
        .all(`語言 : ("${name}")`, LANGS_PER_DIALECT) as Array<
        Record<string, unknown>
      >;
      for (const row of rows) languageRows.set(Number(row._rowid), row);
    }
    const byChar = source
      .query(`SELECT rowid AS _rowid, * FROM langs WHERE langs MATCH ? LIMIT ?`)
      .all(`字組 : (${charMatch})`, LANGS_BY_CHAR_LIMIT) as Array<
      Record<string, unknown>
    >;
    for (const row of byChar) languageRows.set(Number(row._rowid), row);

    // 保证每个“样本方言 × 样本字”都有读音，便于测试跨方言查询。
    const byCharAndDialect = source
      .query(`SELECT rowid AS _rowid, * FROM langs WHERE langs MATCH ? LIMIT 5000`)
      .all(
        `(字組 : (${charMatch})) AND (語言 : (${dialectMatch}))`,
      ) as Array<Record<string, unknown>>;
    for (const row of byCharAndDialect) {
      languageRows.set(Number(row._rowid), row);
    }

    const langs = [...languageRows.values()];

    const dictRows = source
      .query(`SELECT * FROM mcpdict WHERE mcpdict MATCH ? LIMIT 200`)
      .all(`漢字 : (${charMatch})`) as Array<Record<string, unknown>>;

    const insertedInfo = insertRows(
      target,
      "info",
      columnNames(source, "info"),
      sampleInfo,
    );
    const insertedLangs = insertRows(
      target,
      "langs",
      columnNames(source, "langs"),
      langs,
    );
    const insertedDict = insertRows(
      target,
      "mcpdict",
      columnNames(source, "mcpdict"),
      dictRows,
    );

    if (insertedInfo === 0 || insertedLangs === 0 || insertedDict === 0) {
      throw new Error(
        `样本为空: info=${insertedInfo}, langs=${insertedLangs}, mcpdict=${insertedDict}`,
      );
    }

    target.exec("VACUUM");
  } finally {
    target.close();
    source.close();
  }

  const { db: check, meta } = openDatabaseWithMeta(out);
  check.close();

  console.log("✅ fixture 生成完成");
  console.log(`   ${out} (${formatBytes(meta.size)})`);
  console.log(
    `   langs=${meta.tables.langs}, mcpdict=${meta.tables.mcpdict}, info=${meta.tables.info}, visible=${meta.visibleDialects}`,
  );
}

try {
  main();
} catch (error) {
  console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
