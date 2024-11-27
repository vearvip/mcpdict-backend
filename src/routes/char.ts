import { Elysia } from 'elysia'
// @ts-ignore
import { extractHanzi, queryVariant } from '@vearvip/hanzi-utils';
import { queryChars } from '../services/char'

export const charRoutes = new Elysia()
  .group('/chars', (app) => app
    .get('/', ({query}) => {
      // console.log('query', query)
      if (!query.q) {
        return new Response('请输入要查询的汉字', { status: 404 })
      }
      console.log('extractHanzi', extractHanzi(query.q))
      const chars = extractHanzi(query.q).reduce((ret: string[], val: string) => {
        const variants = queryVariant(val)
        // console.log('variants', val, variants)
        if (variants) {
          ret.push(val, ...variants)
        } else {
          ret.push(val)
        }
        return ret
      }, [])
      // console.log('chars', chars)
      const charInfos =  queryChars(chars)
      return charInfos
    }) 
  )
 