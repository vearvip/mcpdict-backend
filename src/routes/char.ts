import express from 'ultimate-express';
import { queryVariant } from "@vearvip/hanzi-utils";
import * as chatService from '../services/char'; 

const router = express.Router();
 

router.get('/', (req: express.Request, res: express.Response) => {
  // const charList: string[] = req?.body?.char || [];
  // const dialectList: string[] = req?.body?.dialect || [];
  // console.log(req?.body)
  if (!req.query.char) {
    throw new Error('请传入汉字！')
  } else if (typeof req?.query?.char !== 'string') {
    throw new Error('请传入正确的汉字！')
  } else if (req.query.dialect && typeof req?.query?.dialect !== 'string') {
    throw new Error('请传入正确的方言！')
  }
  const charList: string[] =  (req?.query?.char ?? '').split(',')
  const dialectList: string[] = (req?.query?.dialect ?? '').split(',')

  if (
    !charList || !Array.isArray(charList)
    || (dialectList && !Array.isArray(dialectList))
  ) {
    throw new Error('请传入正确的查询参数')
  } else if (charList.length > 10) {
    throw new Error('单次查询，不能超过10个汉字！')
  } 

  // const variants = chatService.queryVariants(charList);
  const variants = charList.reduce((acc, char) => {
    const variant = queryVariant(char);
    if (variant) {
      acc.push(...variant);
    }
    acc.push(char);
    return acc;
  }, [] as string[])
  console.log('variants', variants)
  const chars = chatService.queryChars(variants, dialectList);

  res.send({
    data: chars,
    success: true
  })
});

export default router;