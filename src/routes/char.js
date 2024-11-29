const express = require('ultimate-express')
const router = express.Router();

// GET 请求：文章列表
router.get('/', (req, res) => {
    res.send('Hello World!2222')
});

module.exports = router