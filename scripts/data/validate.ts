import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "bun:sqlite";
import { openDatabaseWithMeta, type DbMeta } from "../../src/database/open";
import { DEFAULT_DB_PATH } from "./paths";
import { formatBytes } from "./hash";

interface ValidationReport {
  ok: boolean;
  db?: DbMeta;
  checks?: {
    infoToneJson: { total: number; invalid: number; samples: string[] };
    mcpdictSample: boolean;
  };
  error?: string;
}

function parseArgs(argv: string[]): { db: string; json: boolean } {
  const index = argv.indexOf("--db");
  return {
    db: resolve(index >= 0 ? argv[index + 1] : DEFAULT_DB_PATH),
    json: argv.includes("--json"),
  };
}

export function validateData(path: string): ValidationReport {
  if (!existsSync(path)) {
    return { ok: false, error: `数据库不存在: ${path}（先运行 bun run data:fetch）` };
  }

  let db: Database;
  let meta: DbMeta;
  try {
    ({ db, meta } = openDatabaseWithMeta(path));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    const toneRows = db
      .query(`SELECT ${'"聲調"'} AS tone FROM ${'"info"'}`)
      .all() as Array<{ tone?: string | null }>;

    let invalid = 0;
    const samples: string[] = [];
    for (const row of toneRows) {
      const value = row.tone;
      if (!value) continue;
      try {
        JSON.parse(value);
      } catch {
        invalid += 1;
        if (samples.length < 5) samples.push(String(value).slice(0, 80));
      }
    }

    const sample = db
      .query(`SELECT * FROM ${'"mcpdict"'} WHERE ${'"漢字"'} MATCH ? LIMIT 1`)
      .get("說") as Record<string, unknown> | null;

    const report: ValidationReport = {
      ok: true,
      db: meta,
      checks: {
        infoToneJson: {
          total: toneRows.length,
          invalid,
          samples,
        },
        mcpdictSample: Boolean(sample),
      },
    };

    if (invalid > 0) {
      report.ok = false;
      report.error = `info.聲調 有 ${invalid} 行不是合法 JSON`;
    }
    if (!sample) {
      report.ok = false;
      report.error = report.error
        ? `${report.error}; mcpdict 中查不到“說”`
        : "mcpdict 中查不到“說”";
    }

    return report;
  } finally {
    db.close();
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const report = validateData(options.db);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else if (report.ok && report.db) {
    console.log("✅ 数据库校验通过");
    console.log(`   路径: ${report.db.path}`);
    console.log(`   大小: ${formatBytes(report.db.size)}`);
    console.log(
      `   行数: langs=${report.db.tables.langs}, mcpdict=${report.db.tables.mcpdict}, info=${report.db.tables.info}`,
    );
    console.log(`   可见方言点: ${report.db.visibleDialects}`);
    console.log(
      `   聲調 JSON: ${report.checks?.infoToneJson.total} 行, 非法 ${report.checks?.infoToneJson.invalid}`,
    );
  } else {
    console.error(`❌ ${report.error ?? "数据库校验失败"}`);
  }

  if (!report.ok) process.exit(1);
}

if (import.meta.main) main();
