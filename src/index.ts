import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";
import { cors } from "@elysiajs/cors";
import { errorFormatterPlugin, responseFormatterPlugin } from "./plugins";
import { queryDialectInfos } from "./services/dialect";
import { dbClient, dbMeta } from "./database";
import { config, isProduction } from "./config";

const { dialectInfos, dialectNames, dialectNamesSet, dialectInfosMap } =
  queryDialectInfos();

const app = new Elysia().state({
  dialectInfos,
  dialectNames,
  dialectNamesSet,
  dialectInfosMap,
});

app.use(
  cors({
    origin: config.corsOrigins,
  }),
);

// 包装成功返回信息
app.use(responseFormatterPlugin);
// 包装错误返回信息
app.use(errorFormatterPlugin);

app.get("/health", () => {
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
});

app.get("/meta", () => ({
  service: "mcpdict-backend",
  version: process.env.npm_package_version ?? "unknown",
  nodeEnv: config.nodeEnv,
  db: dbMeta,
}));

// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes);

app.listen(config.port);

console.log(
  [
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
    `   DB: ${dbMeta.path} (${dbMeta.tables.langs.toLocaleString()} langs, ${dbMeta.visibleDialects.toLocaleString()} visible dialects)`,
    `   Env: ${config.nodeEnv}${isProduction() ? "" : " (swagger enabled)"}`,
  ].join("\n"),
);
