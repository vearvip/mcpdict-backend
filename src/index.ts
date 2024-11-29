import express, { Express } from 'ultimate-express';
import cors from 'cors';
import charRouter from './routes/char';

const app: Express = express();
const port: number = 3000;

app.use(cors());

app.use("/char", charRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});