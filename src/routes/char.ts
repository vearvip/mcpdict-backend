import { Elysia } from 'elysia'
// @ts-ignore
import { extractHanzi } from '@vearvip/hanzi-utils';
import { queryChars } from '../services/char'

export const charRoutes = new Elysia()
  .group('/chars', (app) => app
    .get('/', ({query}) => {
      console.log('query', query)
      if (!query.q) {
        return new Response('请输入要查询的汉字', { status: 404 })
      }
      const queryStr = extractHanzi(query.q)
      console.log('queryStr', queryStr)
      const chars = queryChars(queryStr)
      return chars
    }) 
  )
 