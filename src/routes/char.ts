import express from 'ultimate-express';
import * as chatService from '../services/chat';

const router = express.Router();


router.get('/', (req: express.Request, res: express.Response) => {
  const variants = chatService.queryVariants(req.query.q as string | undefined);
  const chars = chatService.queryChars(variants)

  res.send({
    data: chars
  });
});

export default router;