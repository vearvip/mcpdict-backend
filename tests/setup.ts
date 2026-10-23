import { existsSync } from "node:fs";
import { resolve } from "node:path";

const fixture = resolve(import.meta.dir, "fixtures/mcpdict.sample.db");
if (!existsSync(fixture)) {
  throw new Error(
    `测试 fixture 不存在: ${fixture}\n先运行: bun run data:fixture`,
  );
}

process.env.DB_PATH = fixture;
process.env.NODE_ENV = "test";
