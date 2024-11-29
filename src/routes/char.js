const express = require('ultimate-express');
const chatService = require('../services/chat');

const router = express.Router();

// GET 请求：文章列表
router.get('/', (req, res) => {
    const result = chatService.queryVariants(req.query.q);
    
    res.send({
        x:'Hello World!2222',
        result
    });
});

module.exports = router;