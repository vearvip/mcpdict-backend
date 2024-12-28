import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";  
import { cors } from '@elysiajs/cors'
import { dbClient } from './database'
import { JianCheng, YinDianYanSe } from "./utils/constant";

 

const app = new Elysia ({
  store: {
    dialectInfos: null,
    dialectNames: null
  }
});

// 创建一个插件用于初始化方言信息
export const dialectPlugin = (app: Elysia) => {
  if (!app.store.dialectInfos) {
    const sqlStr = `SELECT * FROM info`;
    const stmt = dbClient.prepare(sqlStr);
    const rows = stmt.all(); // 假设db库支持同步操作

    const dialectInfos = rows.filter(ele => ele[YinDianYanSe]);
    app.store.dialectInfos = dialectInfos;
    app.store.dialectNames = dialectInfos.map(ele => ele[JianCheng]);
  }
};
// 创建一个插件用于捕获异常
export const errorFormatterPlugin = (app: Elysia) => {
  return app.onError(({ code, error }) => {
    // console.error('error', error) 
    if (code === 'NOT_FOUND') {
        return {
          success: false,
          message: '你迷路了老铁😜'
        }
    }

    return {
      success: false,
      message: error.message
    };
  });
};
// 创建一个插件用于包装返回信息
export const responseFormatterPlugin = (app: Elysia) => {
  return app.onAfterHandle(({ request, response }) => {
    // 检查请求路径是否为Swagger相关路径
    if (request.url.includes('/swagger')) {
      return response; // 如果是Swagger相关请求，直接返回原始响应
    }

    if (response instanceof Response) {
      return response; // 如果是原生Response对象，不做处理
    }
 
    return {
      success: true,
      data: response
    };
  });
};



app.use(cors())

app.use(responseFormatterPlugin)
app.use(errorFormatterPlugin)


app.use(dialectPlugin)
// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes)

app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
