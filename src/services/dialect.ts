import { extractHanzi } from "@vearvip/hanzi-utils";
import { dbClient } from "../database";
import {
  YuYan,
  JianCheng,

  LuRuRen,
  LaiYuan,
  WenJianMing,
  BanBen,
  ZiShu,
  WuZhengZiShu,
  YinJieShu,
  BuDaiDiaoYinJieShu,

  JingWeiDu,

  DiTuJiErFenQv,
  DiTuJiErYanSe,
  DiTuJiErPaiXv,

  YinDianFenQv,
  YinDianYanSe,
  YinDianPaiXv,

  ShengDiao,

  Sheng,
  Shi,
  Xian,
  Zhen,
  Cun,
  ZiRanCun,
  JieXiRiZhi,
} from "../utils/constant";


// 查询方言信息
export const queryDialectInfos = () => {
  const sqlStr = `SELECT * FROM info`;
  const stmt = dbClient.prepare(sqlStr);
  const rows = stmt.all(); // 假设db库支持同步操作

  const dialectInfos = rows
    .filter((dialectInfoItem: any) => dialectInfoItem[YinDianYanSe])
    .map((ele: any) => {
      
      const item = {
        [YuYan]: ele[YuYan],
        [JianCheng]: ele[JianCheng],
        [LuRuRen]: ele[LuRuRen],
        [LaiYuan]: ele[LaiYuan],
        [WenJianMing]: ele[WenJianMing],
        [BanBen]: ele[BanBen],
        [ZiShu]: ele[ZiShu],
        [WuZhengZiShu]: ele[WuZhengZiShu],
        [YinJieShu]: ele[YinJieShu],
        [BuDaiDiaoYinJieShu]: ele[BuDaiDiaoYinJieShu],
        [JingWeiDu]: ele[JingWeiDu],
        [DiTuJiErFenQv]: ele[DiTuJiErFenQv],
        [DiTuJiErYanSe]: ele[DiTuJiErYanSe],
        [DiTuJiErPaiXv]: ele[DiTuJiErPaiXv],
        [YinDianFenQv]: ele[YinDianFenQv],
        [YinDianYanSe]: ele[YinDianYanSe],
        [YinDianPaiXv]: ele[YinDianPaiXv],
        [ShengDiao]: ele[ShengDiao],
        [Sheng]: ele[Sheng],
        [Shi]: ele[Shi],
        [Xian]: ele[Xian],
        [Zhen]: ele[Zhen],
        [Cun]: ele[Cun],
        [ZiRanCun]: ele[ZiRanCun],
        // [JieXiRiZhi]: ele[JieXiRiZhi],
      }
    

      return item
    });
  const dialectNames = dialectInfos.map((dialectInfoItem: any) => dialectInfoItem[JianCheng])
  return {
    dialectInfos,
    dialectNames
  }
};

