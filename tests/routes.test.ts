import { describe, expect, test } from "bun:test";
import { createApp } from "../src/app";
import { dbClient } from "../src/database";

const app = createApp();

async function jsonRequest(path: string, init?: RequestInit) {
  const response = await app.handle(
    new Request(`http://localhost${path}`, init),
  );
  const body = (await response.json()) as Record<string, unknown>;
  return { response, body };
}

function post(path: string, body: unknown) {
  return jsonRequest(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("legacy routes", () => {
  test("GET /dialect keeps the legacy positional array", async () => {
    const { response, body } = await jsonRequest("/dialect");
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    const rows = body.data as unknown[][];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toHaveLength(24);
    expect(typeof rows[0][1]).toBe("string");
    expect(typeof rows[0][9]).toBe("object");
  });

  test("GET /dialect/item returns one dialect", async () => {
    const { response, body } = await jsonRequest(
      `/dialect/item?name=${encodeURIComponent("廣韻")}`,
    );
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect((body.data as Record<string, unknown>)["簡稱"]).toBe("廣韻");
  });

  test("GET /dialect/item missing returns 404", async () => {
    const { response, body } = await jsonRequest(
      `/dialect/item?name=${encodeURIComponent("不存在")}`,
    );
    expect(response.status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("POST /char returns rows and variants", async () => {
    const { response, body } = await post("/char", {
      charList: ["說"],
      dialectList: ["廣韻"],
    });
    expect(response.status).toBe(200);
    const data = body.data as {
      data: Array<Record<string, unknown>>;
      variants: string[];
    };
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.variants).toContain("說");
  });

  test("POST /char does not allow FTS injection to return everything", async () => {
    const { response, body } = await post("/char", {
      charList: ['說"; DROP--'],
    });
    expect(response.status).toBe(200);
    const data = body.data as { data: unknown[] };
    expect(data.data.length).toBeLessThan(100);
    const count = dbClient.query("SELECT COUNT(*) AS c FROM langs").get() as {
      c: number;
    };
    expect(count.c).toBeGreaterThan(0);
  });

  test("POST /char rejects missing body with 400", async () => {
    const { response, body } = await post("/char", {});
    expect(response.status).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("POST /char/byType rejects cidian with 400", async () => {
    const { response, body } = await post("/char/byType", {
      queryStr: "說",
      queryType: "cidian",
    });
    expect(response.status).toBe(400);
    expect(body.code).toBe("UNSUPPORTED_QUERY_TYPE");
  });

  test("POST /char/byType duyin works", async () => {
    const { response, body } = await post("/char/byType", {
      queryStr: "sue3",
      queryType: "duyin",
      dialectList: ["臺灣"],
    });
    expect(response.status).toBe(200);
    const data = body.data as { data: unknown[]; variants: string[] };
    expect(data.data.length).toBeGreaterThan(0);
  });

  test("POST /char/info rejects unknown columns with 400", async () => {
    const { response, body } = await post("/char/info", {
      char: "說",
      infoKeyList: ["不存在列"],
    });
    expect(response.status).toBe(400);
    expect(body.code).toBe("UNKNOWN_INFO_KEY");
  });

  test("POST /char/info returns only requested columns", async () => {
    const { response, body } = await post("/char/info", {
      char: "說",
      infoKeyList: ["康熙"],
    });
    expect(response.status).toBe(200);
    const rows = body.data as Array<Record<string, unknown>>;
    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0])).toContain("康熙");
    expect(Object.keys(rows[0])).toContain("漢字");
    expect(Object.keys(rows[0])).not.toContain("*");
  });

  test("POST /char/info maps legacy 五筆86版 to the real column", async () => {
    const { response, body } = await post("/char/info", {
      char: "說",
      infoKeyList: ["五筆86版"],
    });
    expect(response.status).toBe(200);
    const rows = body.data as Array<Record<string, unknown>>;
    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0])).toContain("五筆86版");
    expect(typeof rows[0]["五筆86版"]).toBe("string");
  });
});
