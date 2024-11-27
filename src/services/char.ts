import { extractHanzi } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
import { HZ, VA } from "../utils/constant";

// 查询多个字符的信息
export function queryChars(charList: string[]): any[] { 
  const placeholders = charList.map(char => `'${char}'`).join(', ');
  const sqlStr = `SELECT * FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const rows = dbClient.query(sqlStr).all();
  return rows;
}

// 查询多个字符的变体
export function queryVariants(charStr: string): string[] {
  const charList = extractHanzi(charStr); // 提取字符串中的汉字
  const placeholders = charList.map(char => `'${char}'`).join(', ');
  const sqlStr = `SELECT ${HZ}, ${VA} FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const rows: any[] = dbClient.query(sqlStr).all();

  // 初始化变体数组
  const variants: string[] = [];

  // 遍历查询结果，将每个字符及其变体添加到变体数组中
  rows.forEach(row => {
    variants.push(row[HZ]); // 添加当前字符
    if (typeof row[VA] === 'string') {
      variants.push(...row[VA].split(' ')); // 添加变体
    }
  });

  return variants;
}