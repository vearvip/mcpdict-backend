import express from 'ultimate-express'
import cors from 'cors'
import charRouter from './routes/char.js'

const app = express();
const port = 3000;

app.use(cors())

app.use("/", charRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
