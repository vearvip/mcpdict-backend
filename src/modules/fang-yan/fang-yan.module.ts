import { Module } from '@nestjs/common';
import { FangYanService } from './fang-yan.service';
import { FangYanController } from './fang-yan.controller';

@Module({
  providers: [FangYanService],
  controllers: [FangYanController]
})
export class FangYanModule {}
