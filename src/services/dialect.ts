import { extractHanzi } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
 
 
// 查询方言信息
export function queryDialectInfos(): string[] {   
  const sqlStr = `SELECT * FROM info`;
  const rows = dbClient.query(sqlStr).all(); 
   
  return rows;
}
 