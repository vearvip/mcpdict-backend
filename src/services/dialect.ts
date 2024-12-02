import { extractHanzi } from "@vearvip/hanzi-utils";
import db from "../database";
import { BLACK_LIST, HZ, TABLE_NAME, VA } from "../utils/constant";

// 查询方言名字
export function queryDialectNames(): string[] {   
  const sqlStr = `SELECT name FROM pragma_table_info('${TABLE_NAME}')`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all();
  
  // 提取所有列名并返回为字符串数组
  const allTableNames =  rows.map(row => row.name); 
  const dialects = allTableNames.filter(name => !BLACK_LIST.includes(name));
  return dialects;
}
 
// 查询方言信息
export function queryDialectInfos(): string[] {   
  const sqlStr = `SELECT * FROM info`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all();
   
  return rows;
}
 