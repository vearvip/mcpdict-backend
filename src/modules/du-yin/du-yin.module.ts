import { Module } from '@nestjs/common';
import { DuYinService } from './du-yin.service';
import { DuYinController } from './du-yin.controller';

@Module({
  providers: [DuYinService],
  controllers: [DuYinController]
})
export class DuYinModule {}
