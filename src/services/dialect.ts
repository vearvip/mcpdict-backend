import { extractHanzi } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
import { JianCheng, YinDianYanSe } from "../utils/constant";
 
 
// 查询方言信息
export const queryDialectInfos = () => {
  const sqlStr = `SELECT * FROM info`;
  const stmt = dbClient.prepare(sqlStr);
  const rows = stmt.all(); // 假设db库支持同步操作

  const dialectInfos = rows.filter((dialectInfoItem: any) => dialectInfoItem[YinDianYanSe]);
  const dialectNames = dialectInfos.map((dialectInfoItem: any) => dialectInfoItem[JianCheng])
  return {
    dialectInfos,
    dialectNames
  }
};
 
 