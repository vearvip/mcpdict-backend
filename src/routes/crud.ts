import { Elysia } from "elysia";
import { dbClient } from "../database"; 

export const crudRoutes = new Elysia().group("/crud", (app) =>
  app
.post('/create', async ({ body }) => {
  try {
      const { sql } = body;
      const result = await dbClient.query(sql).run();
      return { success: true, result };
  } catch (error) {
      return { success: false, error: error.message };
  }
})
.get('/read', async ({ query }) => {
  try {
      const { sql } = query;
      const result = await dbClient.query(sql).all();
      return { success: true, result };
  } catch (error) {
      return { success: false, error: error.message };
  }
})
.put('/update', async ({ body }) => {
  try {
      const { sql } = body;
      const result = await dbClient.query(sql).run();
      return { success: true, result };
  } catch (error) {
      return { success: false, error: error.message };
  }
})
.delete('/delete', async ({ body }) => {
  try {
      const { sql } = body;
      const result = await dbClient.query(sql).run();
      return { success: true, result };
  } catch (error) {
      return { success: false, error: error.message };
  }
})
);
 
 