import { extractHanzi } from "@vearvip/hanzi-utils";
import db from "../database";
import { HZ, TABLE_NAME, VA } from "../utils/constant";
 
 
// 查询方言信息
export function queryDialectInfos(): string[] {   
  const sqlStr = `SELECT * FROM info`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all();
   
  return rows;
}
 