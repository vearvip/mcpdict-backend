import { Elysia, t } from "elysia";
import * as chatService from "../services/char";
import { HanZi, JianCheng, YinDianFenQv } from "../utils/constant";
import fs from "fs";

export const charRoutes = new Elysia().group("/char", (app) =>
  app
    .post("/", ({ body, store }) => {
      const charList: string[] = (body as any).charList;
      const dialectList: string[] = (body as any).dialectList;

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

      if (queryType === 'duyin') {
        if (!/\d$/.test(queryStr)) {
          throw new Error("请传入以数字声调结尾的音标进行查询，例如：tsin1");
        }
      }
      const charRowsByType = chatService.queryCharsByType(
        queryStr,
        queryType,
        dialectList,
      );
      const variants = charRowsByType.map((ele) => ele[HanZi]);


      if (Array.isArray(variants) && variants.length > 0) {
        const charRows = chatService.queryChars(variants, dialectList);

        // 预处理：构建高效的数据结构
        const charMap = new Map(
          charRows.map((charRow) => [charRow[HanZi], charRow])
        );
        // 预编译正则表达式
        const REGEX_CLEAN = /{[^}]*}|\t/g;
        const REGEX_EXTRACT = /{([^}]*)}/g;

        const charInfos = variants.map((char) => {
          // 快速查找字符信息（O(1)）
          const charRow = charMap.get(char) || {};

          // 排除HanZi属性并过滤方言信息
          const { [HanZi]: _, ...charInfo } = charRow;

          // 一次性过滤所有不符合条件的方言信息
          const filteredCharInfo = Object.entries(charInfo).reduce(
            (acc, [dialectName, value]) => {
              // 获取方言元信息（O(1)）
              const dialectInfo = dialectInfosMap.get(dialectName);

              let parsedVal;
              if (queryType === "duyin") {
                // 处理IPA
                parsedVal = (value || "").replace(REGEX_CLEAN, (m: string) =>
                  m === "\t" ? "|" : ""
                );
              } else if (queryType === "zhushi") {
                // 处理解释
                let matches;
                const extracted: string[] = [];
                while ((matches = REGEX_EXTRACT.exec(value || "")) !== null) {
                  extracted.push(matches[1]);
                }
                parsedVal = extracted.join("|").replaceAll(' ', '');
                REGEX_EXTRACT.lastIndex = 0;
              } else if (queryType === "cidian") {
                // 处理辞典
                // todo...
              }
              // console.log('parsedVal', parsedVal)

              // 复合条件判断
              if (
                value && // 值必须存在
                dialectNamesSet.has(dialectName) && // 必须在允许的方言列表中
                // dialectInfo?.[YinDianFenQv] !== "歷史音" && // 排除历史音
                parsedVal.includes(queryStr) // 必须包含查询字符串
              ) {
                acc[dialectName] = value;
              }
              return acc;
            },
            {}
          );

          return { char, charInfo: filteredCharInfo };
        });

        // const charInfos = variants.map((char) => {
        //   const charInfo =
        //     charRows.find((charRow) => charRow[HanZi] === char) || {};
        //   delete charInfo[HanZi];
        //   for (const dialectName in charInfo) {
        //     if (!charInfo[dialectName] || !store.dialectNamesSet.has(dialectName))
        //       delete charInfo[dialectName];
        //   }
        //   return { char, charInfo };
        // });

        return { data: charInfos, variants };

      } else {
        return { data: null, variants };
      }
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
      const charInfoObj = {};

      variants.forEach((char) => {
        const charInfo =
          charRows.find((charRow) => charRow[HanZi] === char) || {};
        if (charInfo[dialectName]) {
          charInfoObj[char] = charInfo[dialectName];
        }
      });

      return { data: charInfoObj, variants };
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
