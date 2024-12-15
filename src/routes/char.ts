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
    variants: variants,
    success: true
  })
});

router.post('/', (req: express.Request, res: express.Response) => {
  const charList: string[] = req?.body?.charList || [];
  const dialectList: string[] = req?.body?.dialectList || [];
  // console.log(req?.body)
  if (!charList) {
    throw new Error('请传入汉字！')
  } 

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
    variants: variants,
    success: true
  })
});

router.get('/variant', (req: express.Request, res: express.Response) => { 
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
  const charList: string[] = req?.body?.charList ?? [];
  const dialectName: string = req?.body?.dialectName ?? undefined;  
  if (charList.length === 0) {
    throw new Error('请传入长文！')
  } else if (charList.length > 1000) {
    throw new Error('单次长文注音，不能超过1000个汉字！')
  }  else if (!dialectName) {
    throw new Error('请选择方言以后再进行长文搜索！')
  } 
 

  const variants = chatService.queryVariants(charList);  
  const charRows = chatService.queryChars(variants, [dialectName]);
 
  const charInfoObj = {}

  variants.forEach(char => {
    const charInfo = charRows.find(charRow => charRow[HZ] === char)
      // delete charInfo[dialectName];
      if (charInfo[dialectName]) {
        charInfoObj[char] = charInfo[dialectName]
      } 
  })
  res.send({
    data: charInfoObj, 
    variants: variants,
    success: true
  })
});

 
router.post('/info', (req: express.Request, res: express.Response) => {
  const char: string = req?.body?.char 
  const infoKeyList: string[] = req?.body?.infoKeyList 
  // console.log(req?.body)
  if (!char) {
    throw new Error('请传入汉字！')
  } 
  if (!infoKeyList || !Array.isArray(infoKeyList) || infoKeyList.length === 0) {
    throw new Error('请传入需要查询的信息名称！')
  } 
   
  const charRows = chatService.queryCharInfo(char, infoKeyList);
  

  res.send({ 
    data: charRows, 
    success: true
  })
});


 

export default router;