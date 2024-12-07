import express, { Express, json, urlencoded } from 'ultimate-express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan'; 
import charRouter from './routes/char';
import dialectRouter from './routes/dialect';
import { errorMiddleware } from './middlewares/errorMiddleware';
import db from './database';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware';
import { dialectMiddleware } from './middlewares/dialectMiddleware';

const app: Express = express();
const port: number = 3000;
 
 
// setup the logger
app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }) }))

 

// 明确地允许所有源
app.use(cors({ origin: "*" }));

// 使用中间件解析 JSON 格式的请求体
app.use(json());

// 使用中间件解析 URL 编码格式的请求体（例如表单提交）
app.use(urlencoded({ extended: true }));

app.use(dialectMiddleware)
app.use("/char", charRouter);
app.use("/dialect", dialectRouter);

// 处理未匹配到的路由
app.use(notFoundMiddleware);
// 错误处理中间件
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// 确保在应用结束时关闭数据库连接
process.on('exit', () => {
  if (db) {
    db.close();
  }
});