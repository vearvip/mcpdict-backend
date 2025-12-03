import { Elysia, t } from "elysia";
import * as chatService from "../services/char";
import { HanZi, JianCheng, YinDianFenQv, ZiZu } from "../utils/constant";
import fs from "fs";
import { extractHanzi } from "@vearvip/hanzi-utils";

export const charRoutes = new Elysia().group("/char", (app) =>
  app
    .post("/", ({ body, store }) => {
      let charList: string[] = (body as any).charList;
      const dialectList: string[] = (body as any).dialectList;
      // 提取字符串中的汉字
      if (extractHanzi(charList.join("")).length === 0) {
        throw new Error("请传入正确的汉字！");
      }

      if (
        !charList ||
        !Array.isArray(charList) ||
        (dialectList && !Array.isArray(dialectList))
      )
        throw new Error("请传入正确的查询参数");
      if (charList.length > 10) throw new Error("单次查询，不能超过10个汉字！");
      const variants = chatService.queryVariants(charList);
      // console.log('variants', variants)

      const charRows = chatService.queryChars(variants, dialectList);
      

      return { data: charRows, variants };
    })
    .post("/byType", ({ body, store }) => {
      const { dialectNamesSet, dialectInfosMap } = store;

      const queryStr: string = (body as any).queryStr;
      let dialectList: string[] = (body as any).dialectList;
      const queryType: chatService.QueryType = (body as any).queryType;

      // if (queryType === 'duyin') {
      //   if (!/\d$/.test(queryStr)) {
      //     throw new Error("请传入以数字声调结尾的音标进行查询，例如：tsin1");
      //   }
      // }
      const charByTypeRows = chatService.queryCharsByType(
        queryStr,
        queryType,
        dialectList,
      );
      console.log("charByTypeRows:", charByTypeRows);
      const variants = charByTypeRows.map((ele) => ele[ZiZu].split(" ")).flat();

 
        return { data: charByTypeRows, variants: [...new Set(variants)] }; 
    })
    .get("/variant", ({ query }) => {
      if (!query.q) throw new Error("请传入汉字！");
      if (typeof query.q !== "string") throw new Error("请传入正确的汉字！");

      const charList: string[] = (query.q ?? "")
        .split(",")
        .filter((char) => char);
      const variants = chatService.queryVariants(charList);

      return variants;
    })
    .post("/long", ({ body }) => {
      const { charList, dialectName } = body;

      if (charList.length === 0) throw new Error("请传入长文！");
      if (charList.length > 1000)
        throw new Error("单次长文注音，不能超过1000个汉字！");
      if (!dialectName) throw new Error("请选择方言以后再进行长文搜索！");

      const variants = chatService.queryVariants(charList);
      const charRows = chatService.queryChars(variants, [dialectName]);

      return { data: charRows, variants };
    })
    .post("/info", ({ body }) => {
      const { char, infoKeyList } = body;

      if (!char) throw new Error("请传入汉字！");
      if (
        !infoKeyList ||
        !Array.isArray(infoKeyList) ||
        infoKeyList.length === 0
      )
        throw new Error("请传入需要查询的信息名称！");

      const charRows = chatService.queryCharInfo(char, infoKeyList);

      return charRows;
    })
);
