import { Database } from "bun:sqlite";
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dbClient, dbMeta } from "../src/database";
import {
  DatabaseValidationError,
  openDatabase,
  validateDatabase,
} from "../src/database/open";

const tempDir = mkdtempSync(join(tmpdir(), "mcpdict-test-"));

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("database", () => {
  test("fixture 能打开并通过 schema 校验", () => {
    expect(dbMeta.tables.langs).toBeGreaterThan(0);
    expect(dbMeta.tables.mcpdict).toBeGreaterThan(0);
    expect(dbMeta.tables.info).toBeGreaterThan(0);
    expect(dbMeta.visibleDialects).toBeGreaterThan(0);

    const db = openDatabase(process.env.DB_PATH!);
    const row = db.query("SELECT COUNT(*) AS c FROM langs").get() as {
      c: number;
    };
    expect(row.c).toBe(dbMeta.tables.langs);
    db.close();
  });

  test("默认连接可用", () => {
    const row = dbClient.query("SELECT 1 AS ok").get() as { ok: number };
    expect(row.ok).toBe(1);
  });

  test("缺表的数据库会被拒绝", () => {
    const path = join(tempDir, "broken.db");
    const db = new Database(path, { create: true });
    db.exec("CREATE TABLE langs (x TEXT)");
    db.close();

    expect(() => validateDatabase(new Database(path), path)).toThrow(
      DatabaseValidationError,
    );
  });
});
