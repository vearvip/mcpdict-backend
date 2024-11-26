import { Elysia } from "elysia";

export const dialectRoutes = new Elysia().group("/dialects", (app) =>
  app.get("/", () => "List dialects").post("/", () => "Create dialect")
);
