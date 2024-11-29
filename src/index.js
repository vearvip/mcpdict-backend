const express = require('ultimate-express');
const cors = require('cors');
const charRouter = require('./routes/char');

const app = express();
const port = 3000;

app.use(cors());

app.use("/", charRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});