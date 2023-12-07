// users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './utils/decorators';

@Controller('users')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Post('/')
  createUser(@Body() createUserDto: any) {
    return this.appService.create(createUserDto);
  }

  @Public()
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.appService.findOne(id);
  }

  @Public()
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    throw new Error('禁止爬虫');
    return this.appService.remove(id);
  }
}
