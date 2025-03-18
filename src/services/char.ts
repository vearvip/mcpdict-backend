import { extractHanzi } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
import { HanZi, YiTiZi } from "../utils/constant";

export type QueryType = "hanzi" | "duyin" | "zhushi" | "cidian";

// 查询多个字符的信息
export function queryChars(
  charList: string[],
  dialectList?: string[],
  queryType: QueryType = "hanzi"
): any[] {
  const placeholders = charList.join(" OR ");
  let colStr = "*";
  if (Array.isArray(dialectList) && dialectList.length > 0) {
    colStr = [...dialectList, HanZi].map((ele) => `\`${ele}\``)?.join(", ");
  }
  let sqlStr = `SELECT ${colStr} FROM mcpdict WHERE ${HanZi} MATCH '${placeholders}'`;

  // console.log("sqlStr ---- ", sqlStr);
  const rows = dbClient.query(sqlStr).all();
  return rows;
}
// 查询多个字符的信息
export function queryCharsByType(
  queryStr: string,
  dialectList?: string[],
  queryType: QueryType = "hanzi"
): any[] {
  let colStr = "*";
  if (Array.isArray(dialectList) && dialectList.length > 0) {
    colStr = [...dialectList, HanZi].map((ele) => `\`${ele}\``)?.join(", ");
  }
  let sqlStr = "";
  if (queryType == "duyin") {
    sqlStr = `SELECT ${colStr} FROM mcpdict WHERE ${(dialectList ?? [])
      .map((dialectName) => {
        return `${dialectName} MATCH '${queryStr}*'`;
      })
      .join(" OR ")}`;
    console.log("sqlStr:", sqlStr);
  } else if (queryType == "zhushi") {
    sqlStr = `SELECT ${colStr} FROM mcpdict WHERE ${(dialectList ?? [])
      .map((dialectName) => {
        return `${dialectName} MATCH '${queryStr}'`;
      })
      .join(" OR ")}`;
    console.log("sqlStr:", sqlStr);
  } else if (queryType == "cidian") {
    // sqlStr = `SELECT * FROM mcpdict WHERE 普通话 MATCH 'dao1'`
  }
  // console.log('sqlStr', sqlStr)
  const rows = dbClient.query(sqlStr).all();
  return rows;
}

// 查询多个字符的信息
export function queryCharInfo(char: string, infoKeyList: string[]): any[] {
  let colStr = "*";
  if (Array.isArray(infoKeyList) && infoKeyList.length > 0) {
    colStr = [...infoKeyList, HanZi].map((ele) => `\`${ele}\``)?.join(", ");
  }
  const sqlStr = `SELECT ${colStr}, ${HanZi} FROM mcpdict WHERE ${HanZi} MATCH '${char}'`;
  // console.log('sqlStr', sqlStr)
  const rows = dbClient.query(sqlStr).all();
  return rows;
}

// 查询多个字符的变体
export function queryVariants(charList: string[]): string[] {
  const hanziCharList = extractHanzi(charList.join("")); // 提取字符串中的汉字
  const placeholders = hanziCharList.join(" OR ");
  const sqlStr = `SELECT ${HanZi}, ${YiTiZi} FROM mcpdict WHERE ${HanZi} MATCH '${placeholders}'`;
  const rows = dbClient.query(sqlStr).all();

  // 初始化变体数组
  const variants: string[] = [];

  // 遍历查询结果，将每个字符及其变体添加到变体数组中
  rows.forEach((row: any) => {
    variants.push(row[HanZi]); // 添加当前字符
    if (typeof row[YiTiZi] === "string") {
      variants.push(...row[YiTiZi].split(" ")); // 添加变体
    }
  });

  return variants;
}
