import { Elysia } from "elysia";

export const dialectRoutes = new Elysia().group("/dialect", (app) =>
  app.get("/", ({ store }) => {
    // let result = store.dialectInfos.map((item) => {
    //   return Object.values(item);
    // });
    // return result
    return store.dialectInfos
  })
);
