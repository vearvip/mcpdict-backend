import { Body, Controller, Post } from '@nestjs/common'; 
import { FangYanService } from './fang-yan.service';
import { Public } from "src/utils/decorators";

@Controller('fang-yan')
export class FangYanController {
  constructor(
    private readonly fangYanService: FangYanService,

  ) {}

  @Public()
  @Post('/query')
  query(@Body() query: {
    ids?: number[],  
  }) {
    // console.log({
    //   query
    // })
    return this.fangYanService.findYangYans({
      ids: query.ids,  
    })
  } 

  @Post('/queryAll')
  queryAll(@Body() query: {
    id: number,  
  }) {
    // console.log({
    //   query
    // })
    return this.fangYanService.findYangYanAll({
      id: query.id,  
    })
  }
}
