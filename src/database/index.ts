import { Database } from 'bun:sqlite';
import path from 'path';

const dbPath = path.resolve(__dirname, '../database/mcpdict.db');

let dbClient: Database;

try {
  // 连接数据库
  dbClient = new Database(dbPath);
  console.log('数据库连接成功！');
} catch (error) {
  console.error('数据库连接失败：', error);
  process.exit(1); // 退出进程，防止应用继续运行
}

export { dbClient };