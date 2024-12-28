import { Elysia } from "elysia";

export const dialectRoutes = new Elysia().group("/dialect", (app) =>
  app.get("/", ({ store }) => {
    // return '哈哈哈'
    return store.dialectInfos
  })
);
