import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 数据库路径解析顺序：
 * 1. 显式传入的 path
 * 2. DB_PATH 环境变量
 * 3. ./data/mcpdict.db        （新数据管线的默认输出）
 * 4. ./src/database/mcpdict.db（旧仓库/本地开发）
 * 5. ./mcpdict.db             （Docker 镜像内 /app/mcpdict.db）
 */
export function resolveDatabasePath(explicit?: string): string {
  const candidates = [
    explicit,
    process.env.DB_PATH,
    "./data/mcpdict.db",
    "./src/database/mcpdict.db",
    "./mcpdict.db",
  ].filter((value): value is string => Boolean(value));

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      [
        "找不到 mcpdict 数据库文件。",
        "本地开发请先运行: bun run data:fetch",
        "或显式设置 DB_PATH=/path/to/mcpdict.db",
        `已检查: ${candidates.join(", ")}`,
      ].join("\n"),
    );
  }

  return resolve(found);
}

function parseCorsOrigins(value: string | undefined): true | string[] {
  if (!value || value.trim() === "*") return true;
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbPath: resolveDatabasePath(),
  manifestPath: resolve(process.env.DATA_MANIFEST ?? "./data/manifest.json"),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}
