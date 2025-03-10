import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";
import { cors } from '@elysiajs/cors'
import { errorFormatterPlugin, responseFormatterPlugin } from "./plugins";
import { queryDialectInfos } from "./services/dialect";

const { dialectInfos, dialectNames } = queryDialectInfos()

const app = new Elysia()
  .state({ dialectInfos, dialectNames })

 
app.use(cors({
  origin: [
    /.*\.vear\.vip$/,
    /.*\.github\.dev$/,
  ]
}))

// 包装成功返回信息
app.use(responseFormatterPlugin)
// 包装错误返回信息
app.use(errorFormatterPlugin)

// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes)

app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
