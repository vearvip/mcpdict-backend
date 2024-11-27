import { Elysia } from 'elysia'
import * as charServices from '../services/char'

export const charRoutes = new Elysia()
  .group('/char', (app) => app
    .get('/', ({ query }) => {
      // console.log('query', query)
      if (!query.q) {
        return new Response('请输入要查询的汉字', { status: 404 })
      } 
      const chars = charServices.queryVariants(query.q)
      console.log('chars', chars)
      const charInfos = charServices.queryChars(chars)
      return charInfos
    })
    .get('/va', ({ query }) => {
      // console.log('query', query)
      if (!query.q) {
        return new Response('请输入要查询的汉字', { status: 404 })
      }    
      return charServices.queryVariants(query.q)
    })
  )
