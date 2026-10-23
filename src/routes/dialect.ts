import { Elysia, t } from "elysia";
import { notFound } from "../errors";
import {
  YuYan,
  JianCheng,
 
  JingWeiDu,

  DiTuJiErFenQv,
  DiTuJiErYanSe,
  DiTuJiErPaiXv,

  YinDianFenQv,
  YinDianYanSe,
  YinDianPaiXv,

  WeiHuRen,
  CanKaoWenXian,
  BuChongYueDu,
  YinXiShuoMing,

  ShengDiao,

  Sheng,
  Shi,
  Xian,
  Zhen,
  Cun,
  ZiRanCun,
  ZiShu,
  WuZhengZiShu,
  YinJieShu,
  BuDaiDiaoYinJieShu, 
} from "../utils/constant";

function parseTone(value: unknown): Record<string, unknown> {
  if (typeof value !== "string" || value.trim() === "") return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export const dialectRoutes = new Elysia().group("/dialect", (app) =>
  app
    .get("/", ({ store }) => {
      // @ts-ignore
      let result = ((store?.dialectInfos) ?? []).map((item: any) => {
        let element = {
          [YuYan]: item[YuYan], // [0] 语言 
          [JianCheng]: item[JianCheng], // [1] 简称
          [JingWeiDu]: item[JingWeiDu], // [2] 经纬度
          [DiTuJiErFenQv]: item[DiTuJiErFenQv], // [3] 地图集二分区
          [DiTuJiErYanSe]: item[DiTuJiErYanSe], // [4] 地图集二颜色
          [DiTuJiErPaiXv]: item[DiTuJiErPaiXv], // [5] 地图集二排序
          [YinDianFenQv]: item[YinDianFenQv], // [6] 音典分区
          [YinDianYanSe]: item[YinDianYanSe], // [7] 音典颜色
          [YinDianPaiXv]: item[YinDianPaiXv], // [8] 音典排序
          [ShengDiao]: parseTone(item[ShengDiao]), // [9] 声调
          [Sheng]: item[Sheng], // [10] 声
          [Shi]: item[Shi], // [11] 市
          [Xian]: item[Xian], // [12] 县
          [Zhen]: item[Zhen], // [13] 镇
          [Cun]: item[Cun], // [14] 村
          [ZiRanCun]: item[ZiRanCun], // [15] 自然村
          [ZiShu]: item[ZiShu], // [16] 字數
          [WuZhengZiShu]: item[WuZhengZiShu], // [17] □數
          [YinJieShu]: item[YinJieShu], // [18] 音節數
          [BuDaiDiaoYinJieShu]: item[BuDaiDiaoYinJieShu], // [19] 不帶調音節數
          [WeiHuRen]: item[WeiHuRen], // [20] 維護人
          [CanKaoWenXian]: item[CanKaoWenXian], // [21] 參考文獻
          [BuChongYueDu]: item[BuChongYueDu], // [22] 補充閲讀
          [YinXiShuoMing]: item[YinXiShuoMing], // [23] 音系說明
        }
        return Object.values(element)
      })


      return result
    })
    .get(
      "/item",
      ({ store, query }) => {
        // @ts-ignore
        const result = ((store?.dialectInfos) ?? []).find(
          (item: any) => item[JianCheng] === query.name,
        );
        if (!result) {
          throw notFound("未找到该方言");
        }
        return result;
      },
      {
        query: t.Object({
          name: t.String({ minLength: 1, maxLength: 100 }),
        }),
      },
    )
);
