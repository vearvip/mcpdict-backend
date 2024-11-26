import { Elysia } from "elysia";

export const charRoutes = new Elysia().group("/chars", (app) =>
  app.get("/", () => "List chars").post("/", () => "Create char")
);
