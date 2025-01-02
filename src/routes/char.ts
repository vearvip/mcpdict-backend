import { Elysia, t } from 'elysia';
import * as chatService from '../services/char';
import { HanZi } from '../utils/constant';

export const charRoutes = new Elysia().group("/char", (app) =>
  app
    .post('/', ({ body, store }) => {
      const charList: string[] = (body as any).charList
      const dialectList: string[] = (body as any).dialectList;
      if (!charList || !Array.isArray(charList) || (dialectList && !Array.isArray(dialectList)))
        throw new Error('请传入正确的查询参数');
      if (charList.length > 10) throw new Error('单次查询，不能超过10个汉字！');

      const variants = chatService.queryVariants(charList);
      const charRows = chatService.queryChars(variants, dialectList);
      const charInfos = variants.map(char => {
        const charInfo = charRows.find(charRow => charRow[HanZi] === char) || {};
        delete charInfo[HanZi];
        for (const dialectName in charInfo) {
          if (!charInfo[dialectName] || !store.dialectNames.includes(dialectName))
            delete charInfo[dialectName];
        }
        return { char, charInfo };
      })

      return { data: charInfos, variants };
    } )
    .get('/variant', ({ query }) => {
      if (!query.q) throw new Error('请传入汉字！');
      if (typeof query.q !== 'string') throw new Error('请传入正确的汉字！');

      const charList: string[] = (query.q ?? '').split(',').filter(char => char);
      const variants = chatService.queryVariants(charList);

      return variants;
    })
    .post('/long', ({ body }) => {
      const { charList, dialectName } = body;

      if (charList.length === 0) throw new Error('请传入长文！');
      if (charList.length > 1000) throw new Error('单次长文注音，不能超过1000个汉字！');
      if (!dialectName) throw new Error('请选择方言以后再进行长文搜索！');

      const variants = chatService.queryVariants(charList);
      const charRows = chatService.queryChars(variants, [dialectName]);
      const charInfoObj = {};

      variants.forEach(char => {
        const charInfo = charRows.find(charRow => charRow[HanZi] === char) || {};
        if (charInfo[dialectName]) {
          charInfoObj[char] = charInfo[dialectName];
        }
      });

      return { data: charInfoObj, variants, };
    })
    .post('/info', ({ body }) => {
      const { char, infoKeyList } = body;

      if (!char) throw new Error('请传入汉字！');
      if (!infoKeyList || !Array.isArray(infoKeyList) || infoKeyList.length === 0)
        throw new Error('请传入需要查询的信息名称！');

      const charRows = chatService.queryCharInfo(char, infoKeyList);

      return charRows;
    })
);
