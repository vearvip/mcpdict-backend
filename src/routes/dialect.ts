import { Elysia } from "elysia";
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

  ShengDiao,

  Sheng,
  Shi,
  Xian,
  Zhen,
  Cun,
  ZiRanCun, 
} from "../utils/constant";

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
          [ShengDiao]: JSON.parse(item[ShengDiao]), // [9] 声调
          [Sheng]: item[Sheng], // [10] 声
          [Shi]: item[Shi], // [11] 市
          [Xian]: item[Xian], // [12] 县
          [Zhen]: item[Zhen], // [13] 镇
          [Cun]: item[Cun], // [14] 村
          [ZiRanCun]: item[ZiRanCun], // [15] 自然村
        }
        return Object.values(element)
      })


      return result
    })
    .get("/item", ({ store, query }) => {
      // @ts-ignore
      let result = ((store?.dialectInfos) ?? []).find((item: any) => item[JianCheng] === query.name)

      return result
    })
);
