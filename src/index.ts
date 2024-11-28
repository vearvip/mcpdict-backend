import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char"; 
import { crudRoutes } from "./routes/crud";
import { cors } from '@elysiajs/cors'
const app = new Elysia();

app.use(cors())
// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes).use(crudRoutes)

// 处理未匹配到的路由
app.all("*", () => {
  return new Response("Not Found", { status: 404 });
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
