import { Elysia, t } from "elysia";
import * as charService from "../services/char";
import { ZiZu } from "../utils/constant";
import { badRequest } from "../errors";

const dialectListSchema = t.Optional(
  t.Array(t.String({ maxLength: 100 }), { maxItems: 3000 }),
);

const charBodySchema = t.Object({
  charList: t.Array(t.String({ maxLength: 20 }), {
    minItems: 1,
    maxItems: 50,
  }),
  dialectList: dialectListSchema,
});

export const charRoutes = new Elysia().group("/char", (app) =>
  app
    .post(
      "/",
      ({ body }) => {
        const chars = charService.normalizeChars(body.charList);
        if (chars.length > 10) {
          throw badRequest("单次查询，不能超过10个汉字！", "TOO_MANY_HANZI");
        }

        const variants = charService.queryVariants(chars);
        const charRows = charService.queryChars(variants, body.dialectList);

        return { data: charRows, variants };
      },
      { body: charBodySchema },
    )
    .post(
      "/byType",
      ({ body }) => {
        const charByTypeRows = charService.queryCharsByType(
          body.queryStr,
          body.queryType,
          body.dialectList,
        );
        const variants = [
          ...new Set(
            charByTypeRows
              .flatMap((row) => String(row[ZiZu] ?? "").split(" "))
              .filter(Boolean),
          ),
        ];

        return { data: charByTypeRows, variants };
      },
      {
        body: t.Object({
          queryStr: t.String({ minLength: 1, maxLength: 200 }),
          queryType: t.Union([
            t.Literal("hanzi"),
            t.Literal("duyin"),
            t.Literal("zhushi"),
            t.Literal("cidian"),
          ]),
          dialectList: dialectListSchema,
        }),
      },
    )
    .get(
      "/variant",
      ({ query }) => {
        const chars = charService.normalizeChars(query.q.split(","));
        return charService.queryVariants(chars);
      },
      {
        query: t.Object({
          q: t.String({ minLength: 1, maxLength: 200 }),
        }),
      },
    )
    .post(
      "/long",
      ({ body }) => {
        const chars = charService.normalizeChars(body.charList);
        if (chars.length > 1000) {
          throw badRequest(
            "单次长文注音，不能超过1000个汉字！",
            "TOO_MANY_HANZI",
          );
        }
        if (!body.dialectName.trim()) {
          throw badRequest("请选择方言以后再进行长文搜索！", "MISSING_DIALECT");
        }

        const variants = charService.queryVariants(chars);
        const charRows = charService.queryChars(variants, [body.dialectName]);

        return { data: charRows, variants };
      },
      {
        body: t.Object({
          charList: t.Array(t.String({ maxLength: 20 }), {
            minItems: 1,
            maxItems: 2000,
          }),
          dialectName: t.String({ minLength: 1, maxLength: 100 }),
        }),
      },
    )
    .post(
      "/info",
      ({ body }) =>
        charService.queryCharInfo(body.char, body.infoKeyList),
      {
        body: t.Object({
          char: t.String({ minLength: 1, maxLength: 8 }),
          infoKeyList: t.Array(t.String({ maxLength: 50 }), {
            minItems: 1,
            maxItems: 30,
          }),
        }),
      },
    ),
);
