import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";  
import { cors } from '@elysiajs/cors'
import { dbClient } from './database'
import { JianCheng, YinDianYanSe } from "./utils/constant";
const app = new Elysia({
  store: {
    dialectInfos: null,
    dialectNames: null
  }
});
// 创建一个插件用于初始化方言信息
const dialectPlugin = (app: Elysia) => {
  if (!app.store.dialectInfos) {
    const sqlStr = `SELECT * FROM info`;
    const stmt = dbClient.prepare(sqlStr);
    const rows = stmt.all(); // 假设db库支持同步操作

    const dialectInfos = rows.filter(ele => ele[YinDianYanSe]);
    app.store.dialectInfos = dialectInfos;
    app.store.dialectNames = dialectInfos.map(ele => ele[JianCheng]);
  }
};
 
app.use(cors())
app.use(dialectPlugin)
// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes)



// 处理未匹配到的路由
app.all("*", () => {
  return new Response("Not Found", { status: 404 });
});


app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
