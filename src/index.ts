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

function getDomain(url: string | null) {
    try {
        const parsedUrl = new URL(url || '');
        return parsedUrl.origin; // 返回协议 + 域名，例如 "https://zany-eureka-9qrg9vjvqgjc95rw-3000.app.github.dev"
    } catch (error: any) {
        console.error("提供的字符串不是有效的URL:", error.message);
        return null;
    }
}
 
app.use(cors({
  origin: (request: Request) => {
    const domain = getDomain(request.headers.get('referer')) || ''
    const vearVipMatchResult = /.*\.vear\.vip$/.test(domain)
    const githubDevMatchResult = /.*\.github\.dev$/.test(domain)
    console.log({
      vearVipMatchResult,
      githubDevMatchResult,
      referer:request.headers.get('referer')
    })
    // return  vearVipMatchResult || githubDevMatchResult
  }
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
