import { Module } from '@nestjs/common';
import { ZiService } from './zi.service';
import { ZiController } from './zi.controller';

@Module({
  providers: [ZiService],
  controllers: [ZiController]
})
export class ZiModule {}
