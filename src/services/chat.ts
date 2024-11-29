import { extractHanzi } from "@vearvip/hanzi-utils";
import db from "../database";
import { HZ, VA } from "../utils/constant";

// 查询多个字符的信息
export function queryChars(charList: string[], dialectList?: string[]): any[] { 
  const placeholders = charList.map(() => '?').join(', ');
  const sqlStr = `SELECT ${dialectList?.join(', ')} FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all(charList);
  return rows;
}

// 查询多个字符的变体
export function queryVariants(charList: string[]): string[] {
  console.log({ charList });
  const hanziCharList = extractHanzi(charList.join('')); // 提取字符串中的汉字
  const placeholders = hanziCharList.map(() => '?').join(', ');
  const sqlStr = `SELECT ${HZ}, ${VA} FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all(hanziCharList);

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
 