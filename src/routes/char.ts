import express from 'ultimate-express';
import * as chatService from '../services/chat'; 

const router = express.Router();
 

router.post('/', (req: express.Request, res: express.Response) => {
  const charList: string[] = req?.body?.char;
  const dialectList: string[] = req?.body?.dialect;
  console.log(req?.body)

  if (
    !charList || !Array.isArray(charList)
    || (dialectList && !Array.isArray(dialectList))
  ) {
    throw new Error('请传入正确的查询参数')
  } else if (charList.length > 10) {
    throw new Error('单次查询，不能超过10个汉字！')
  } 

  // const variants = chatService.queryVariants(charList);
  const chars = chatService.queryChars(charList, dialectList);

  res.send({
    data: chars,
    success: true
  })
});

export default router;