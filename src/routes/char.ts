import express from 'ultimate-express';
import { queryVariant } from "@vearvip/hanzi-utils";
import * as chatService from '../services/char'; 
import { HZ } from '../utils/constant';  
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
  const charList: string[] =  (req?.query?.char ?? '').split(',').filter(char => char)
  const dialectList: string[] = (req?.query?.dialect ?? '').split(',').filter(dialect => dialect)

  if (
    !charList || !Array.isArray(charList)
    || (dialectList && !Array.isArray(dialectList))
  ) {
    throw new Error('请传入正确的查询参数')
  } else if (charList.length > 10) {
    throw new Error('单次查询，不能超过10个汉字！')
  } 

  const variants = chatService.queryVariants(charList);
 
  // console.log('variants', variants) 
  const charRows = chatService.queryChars(variants, dialectList);
 
  const charInfos: any[] = []

  variants.forEach(char => {
    const charInfo = charRows.find(charRow => charRow[HZ] === char)
      delete charInfo[HZ];
      for (const dialectName in charInfo) { 
        const element = charInfo[dialectName];
        if (
          !element
          || !req.app.locals.dialectNames.includes(dialectName)
        ) {
          delete charInfo[dialectName];
        } 
      } 
      charInfos.push({
        char: char,
        charInfo: charInfo, 
      }) 
  })

  res.send({ 
    data: charInfos,
    success: true
  })
});
router.get('/variant', (req: express.Request, res: express.Response) => {
  // const charList: string[] = req?.body?.char || [];
  // const dialectList: string[] = req?.body?.dialect || [];
  // console.log(req?.body)
  if (!req.query.q) {
    throw new Error('请传入汉字！')
  } else if (typeof req?.query?.q !== 'string') {
    throw new Error('请传入正确的汉字！')
  } 
  const charList: string[] =  (req?.query?.q ?? '').split(',').filter(char => char) 

  const variants = chatService.queryVariants(charList);
 
 

  res.send({
    data: variants,
    success: true
  })
});

router.post('/long', (req: express.Request, res: express.Response) => {
  const longCharList: string[] = req?.body?.longCharList ?? [];
  const dialectName: string = req?.body?.dialectName ?? undefined; 
  // console.log(req?.body)
  if (longCharList.length === 0) {
    throw new Error('请传入长文！')
  } else if (longCharList.length > 1000) {
    throw new Error('单次长文注音，不能超过1000个汉字！')
  }  else if (!dialectName) {
    throw new Error('请选择方言以后再进行长文搜索！')
  } 
 

  // const variants = chatService.queryVariants(charList);
  const variants = longCharList.reduce((acc, char) => {
    const variant = queryVariant(char);
    if (variant) {
      acc.push(...variant);
    }
    acc.push(char);
    return acc;
  }, [] as string[])
  // console.log('variants', variants)
  // console.log('dialectName', dialectName)
  const chars = chatService.queryChars(variants, [dialectName]);
 
  const charInfos: any[] = []
  chars.forEach(charInfo => {
    const hanZiChar = charInfo[HZ];
    delete charInfo[HZ];
    for (const dialectName in charInfo) { 
      const element = charInfo[dialectName];
      if (
        !element
        || !req.app.locals.dialectNames.includes(dialectName)
      ) {
        delete charInfo[dialectName];
      } 
    } 
    charInfos.push({
      char: hanZiChar,
      charInfo: charInfo
    }) 
  })

  res.send({
    data: charInfos,
    success: true
  })
});


 

export default router;