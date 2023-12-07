// users.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseFilters, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto'; 

@Controller('users') 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.appService.create(createUserDto);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.appService.findOne(id);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    throw new Error('禁止爬虫')
    return this.appService.remove(id);
  }
}
