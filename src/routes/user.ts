import { Elysia } from "elysia";

export const userRoutes = new Elysia().group("/users", (app) =>
  app.get("/", () => "List users").post("/", () => "Create user")
);
