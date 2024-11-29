import express from 'ultimate-express';
import * as chatService from '../services/chat';

const router = express.Router();

// GET 请求：文章列表
router.get('/', (req: express.Request, res: express.Response) => {
    const result = chatService.queryVariants(req.query.q as string | undefined);
    
    res.send({
        x: 'Hello World!2222',
        result
    });
});

export default router;