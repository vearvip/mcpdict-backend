import { describe, expect, test } from "bun:test";
import { validateData } from "../scripts/data/validate";

describe("data validation", () => {
  test("fixture 通过数据校验", () => {
    const report = validateData(process.env.DB_PATH!);
    expect(report.ok).toBe(true);
    expect(report.db?.tables.langs).toBeGreaterThan(0);
    expect(report.checks?.infoToneJson.invalid).toBe(0);
    expect(report.checks?.mcpdictSample).toBe(true);
  });
});
