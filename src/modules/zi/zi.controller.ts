import { Controller, Post, Body } from '@nestjs/common';
import { ZiService } from './zi.service';
import { notEmptyArr } from 'src/utils';
import { Public } from "src/utils/decorators";

@Controller('zi')
export class ZiController {
  constructor( 
    private readonly ziService: ZiService,
  ) {}

  @Public()
  @Post('/query')
  query(@Body() query: {
    zis?: string[], 
    fangYanIds?: number[]
  }) {
    if (
      notEmptyArr(query.zis) 
      && query.zis.length > 10 
    ) {
      return '查询文字不可超过10个'
    } 

    // console.log({
    //   query
    // })
    return this.ziService.findZis({
      zis: query.zis, 
      fangYanIds: query.fangYanIds,
    })
  }


  @Public()
  @Post('/queryArticle')
  queryArticle(@Body() query: {
    zis?: string[], 
    fangYanId: number
  }) {
    if (
      notEmptyArr(query.zis) 
      && query.zis.length > 200 
    ) {
      return '查询文字不可超过200个'
    }
    if (
      !query.fangYanId
    ) {
      return '请选择长文查询的方言'
    }

    // console.log({
    //   query
    // })
    return this.ziService.findArticle({
      zis: query.zis, 
      fangYanIds: [query.fangYanId],
    })
  }
} 

