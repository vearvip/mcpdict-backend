import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dialectRoutes } from "./routes/dialect";
import { charRoutes } from "./routes/char";
import { userRoutes } from "./routes/user";

const app = new Elysia();

// 注册路由
app.use(swagger()).use(dialectRoutes).use(charRoutes).use(userRoutes);

// 处理未匹配到的路由
app.all("*", () => {
  return new Response("Not Found", { status: 404 });
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
