import { createApp } from "./app";
import { config, isProduction } from "./config";
import { dbMeta } from "./database";

const app = createApp();
app.listen(config.port);

console.log(
  [
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
    `   DB: ${dbMeta.path} (${dbMeta.tables.langs.toLocaleString()} langs, ${dbMeta.visibleDialects.toLocaleString()} visible dialects)`,
    `   Env: ${config.nodeEnv}${isProduction() ? "" : " (swagger enabled)"}`,
  ].join("\n"),
);
