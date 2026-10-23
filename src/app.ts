import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";
import { errorFormatterPlugin, responseFormatterPlugin } from "./plugins";
import { queryDialectInfos } from "./services/dialect";
import { dbClient, dbMeta } from "./database";
import { config } from "./config";

export function createApp() {
  const { dialectInfos, dialectNames, dialectNamesSet, dialectInfosMap } =
    queryDialectInfos();

  const app = new Elysia()
    .state({
      dialectInfos,
      dialectNames,
      dialectNamesSet,
      dialectInfosMap,
    })
    .use(
      cors({
        origin: config.corsOrigins,
        credentials: false,
        maxAge: 86400,
      }),
    )
    // 包装成功返回信息
    .use(responseFormatterPlugin)
    // 包装错误返回信息
    .use(errorFormatterPlugin)
    .get("/health", () => {
      dbClient.query("SELECT 1 AS ok").get();
      return {
        status: "ok",
        db: {
          schemaVersion: dbMeta.schemaVersion,
          size: dbMeta.size,
          tables: dbMeta.tables,
          visibleDialects: dbMeta.visibleDialects,
          checkedAt: dbMeta.checkedAt,
        },
      };
    })
    .get("/meta", () => ({
      service: "mcpdict-backend",
      version: process.env.npm_package_version ?? "unknown",
      nodeEnv: config.nodeEnv,
      db: dbMeta,
    }))
    .use(swagger())
    .use(dialectRoutes)
    .use(charRoutes);

  return app;
}
