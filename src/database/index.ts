import { config } from "../config";
import { openDatabaseWithMeta } from "./open";

/**
 * 生产/开发默认数据库连接。
 *
 * Phase 1 起不再使用 Bun 的 `import ... with { type: "sqlite" }`：
 * 数据库作为外部只读文件，通过 DB_PATH 指定，便于测试、数据更新和 Docker volume。
 */
// 启动时做结构/行数校验，跳过全库 quick_check（4 亿字节级，约 8s）；
// 完整校验放在 `bun run data:validate`。
const opened = openDatabaseWithMeta(config.dbPath, { quickCheck: false });

export const dbClient = opened.db;
export const dbMeta = opened.meta;

export {
  DatabaseValidationError,
  openDatabase,
  openDatabaseWithMeta,
  validateDatabase,
} from "./open";
export type { DbMeta, TableCounts } from "./open";
