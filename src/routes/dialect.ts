import { Elysia } from "elysia";

export const dialectRoutes = new Elysia().group("/dialect", (app) =>
  app.get("/", ({store}) =>  {
    return store.dialectInfos
  })
);
