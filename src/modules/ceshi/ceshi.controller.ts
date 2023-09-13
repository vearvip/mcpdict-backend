import { BadRequestException, Controller, Get, HttpException, HttpStatus, Param, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { CeshiService } from './ceshi.service'; 
import { Public } from "src/utils/decorators";



// 制定下面这样一个统一的接口出参返回的格式，在成功查询到数据时，success为true，查询参数放在data里，入参不正确或者查询出错时，success为false，错误提示放在msg里，在NestJS里怎么实现
// interface Response {
//   data: any;
//   success: boolean;
//   msg: string;
// }

const SafeNumber = (val) => {
  if ( 
    val === undefined
    || val === null
    || val === ''
  ) {
    return undefined
  } else { 
    const pageNum = Number(val)

    return isNaN(pageNum)
      ? undefined
      : pageNum
     
  }
}

@Controller('ceshi')
export class CeshiController {
  constructor( 
    private readonly ceshiService: CeshiService,
  ) {}

  @Public()
  @Get('/queryUsers')
  queryUsers() {
    return this.ceshiService.queryUsers()
  }

  @Public()
  @Get('/queryZis')
  queryZis(@Query() query: {
    zi?: string,
    pageNum?: string,
    pageSize?: string,
  }) {
    console.log({
      query
    })

    const pageNum = SafeNumber(query.pageNum)
    const pageSize = SafeNumber(query.pageSize) 
    if (pageNum <= 0) { 
      const msg = `pageNum不可为${query.pageNum}` 
      throw new Error(msg); // 抛出异常
    }
    if (pageSize <= 0) {
      const msg = `pageSize不可为${query.pageSize}` 
      throw new Error(msg); // 抛出异常 
    }

    return this.ceshiService.queryZis(
      query.zi,
    )
  }

  @Public()
  @Get('/queryFangYans')
  queryFangYans() {
    return this.ceshiService.queryFangYans()
  }
  
  @Public()
  @Get('/')
  index() {
    return 'xxxxx'
  }
 
  @Get('profile')
  getProfile(@Request() req) {
    // console.log('🔥', req)
    return req.user;
  }

  // @Public()
  // @Get('/juen')
  // juen() {
    
  //   return this.ceshiService.juen()
  // }
 
}
