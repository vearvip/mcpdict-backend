import { extractHanzi, splitUnicodeStringIgnoreSequence } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
import {
  CangJie3,
  CangJie5,
  CangeJie6,
  DuYin,
  HanDa,
  HanZi,
  HuiZuan,
  JiYun,
  KangXi,
  LiangFen,
  ShanRenMaLTS,
  ShuoWen,
  WuBi06,
  WuBi86,
  WuBi98,
  WuBiHua,
  YiTiZi,
  YuYan,
  ZhuShi,
  ZiXingBianTi,
  ZiXingMiaoShu,
  ZiZu,
  ZongBiHuaShu,
  BuShouYuBi,
  BuJianJianSuo,
} from "../utils/constant";
import { AppError, badRequest } from "../errors";
import { columnMatch, prefixQuery, quoteFtsValue } from "../utils/fts";
import { quoteIdentifier } from "../utils/sql";

export type QueryType = "hanzi" | "duyin" | "zhushi" | "cidian";

const INFO_COLUMN_MAP: Record<string, string> = {
  [ShuoWen]: ShuoWen,
  [JiYun]: JiYun,
  [HuiZuan]: HuiZuan,
  [KangXi]: KangXi,
  [HanDa]: HanDa,
  [YiTiZi]: YiTiZi,
  [ZiXingBianTi]: ZiXingBianTi,
  [ZiXingMiaoShu]: ZiXingMiaoShu,
  [BuJianJianSuo]: BuJianJianSuo,
  [LiangFen]: LiangFen,
  [ZongBiHuaShu]: ZongBiHuaShu,
  [BuShouYuBi]: BuShouYuBi,
  [WuBiHua]: WuBiHua,
  [WuBi86]: "五筆86",
  [WuBi98]: "五筆98",
  [WuBi06]: "五筆06",
  [CangJie3]: CangJie3,
  [CangJie5]: CangJie5,
  [CangeJie6]: CangeJie6,
  [ShanRenMaLTS]: "山人",
};


export function normalizeChars(input: string[]): string[] {
  const chars = [...new Set(extractHanzi(input.join("")))];
  if (chars.length === 0) {
    throw badRequest("请传入正确的汉字！", "INVALID_HANZI");
  }
  return chars;
}

function dialectClause(dialectList?: string[]): string {
  if (!Array.isArray(dialectList) || dialectList.length === 0) return "";
  return ` AND ${columnMatch(YuYan, dialectList)}`;
}

export function queryChars(
  charList: string[],
  dialectList?: string[],
): Record<string, unknown>[] {
  const match = `${columnMatch(ZiZu, charList)}${dialectClause(dialectList)}`;
  return dbClient
    .query("SELECT * FROM langs WHERE langs MATCH ?")
    .all(match) as Record<string, unknown>[];
}

export function queryCharsByType(
  queryStr: string,
  queryType: QueryType,
  dialectList?: string[],
): Record<string, unknown>[] {
  if (queryType === "cidian") {
    throw new AppError(400, "UNSUPPORTED_QUERY_TYPE", "暂不支持辞典查询");
  }
  if (queryType !== "duyin" && queryType !== "zhushi") {
    throw new AppError(400, "INVALID_QUERY_TYPE", "不支持该查询类型");
  }

  const field = queryType === "duyin" ? DuYin : ZhuShi;
  let value: string;
  if (queryType === "duyin") {
    value = prefixQuery(queryStr);
  } else {
    const tokens = splitUnicodeStringIgnoreSequence(queryStr).filter(Boolean);
    if (tokens.length === 0) {
      throw badRequest("请传入正确的注释内容", "EMPTY_QUERY");
    }
    value = tokens.map((token) => `${quoteFtsValue(token)}*`).join(" ");
  }

  const match = `${field} : (${value})${dialectClause(dialectList)}`;
  return dbClient
    .query("SELECT * FROM langs WHERE langs MATCH ? LIMIT 50")
    .all(match) as Record<string, unknown>[];
}

export function queryCharInfo(
  char: string,
  infoKeyList: string[],
): Record<string, unknown>[] {
  const chars = normalizeChars([char]);
  if (chars.length !== 1) {
    throw badRequest("单字信息查询只能传入一个汉字", "INVALID_HANZI");
  }

  const keys = [...new Set(infoKeyList)];
  const unknown = keys.filter((key) => !INFO_COLUMN_MAP[key]);
  if (unknown.length > 0) {
    throw badRequest(
      `不支持的信息字段: ${unknown.join(", ")}`,
      "UNKNOWN_INFO_KEY",
    );
  }

  const columns = [HanZi, ...keys.filter((key) => key !== HanZi)];
  const select = columns.map((key) => {
    const actual = INFO_COLUMN_MAP[key] ?? key;
    return `${quoteIdentifier(actual)} AS ${quoteIdentifier(key)}`;
  });
  const sql = `SELECT ${select.join(", ")} FROM mcpdict WHERE ${quoteIdentifier(HanZi)} MATCH ?`;
  return dbClient.query(sql).all(chars[0]) as Record<string, unknown>[];
}

export function queryVariants(charList: string[]): string[] {
  const chars = normalizeChars(charList);
  const variants = new Set(chars);

  const rows = dbClient
    .query(`SELECT ${quoteIdentifier(HanZi)} AS hanzi FROM mcpdict WHERE mcpdict MATCH ?`)
    .all(columnMatch(YiTiZi, chars)) as Array<{ hanzi?: string }>;

  for (const row of rows) {
    if (row.hanzi) variants.add(row.hanzi);
  }

  return [...variants];
}
