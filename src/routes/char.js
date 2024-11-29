import express from 'ultimate-express' 
import chatService from '../services/chat.js'; 
const router = express.Router();

// GET 请求：文章列表
router.get('/', (req, res) => {
    chatService.q
    res.send('Hello World!2222')
});

export default router