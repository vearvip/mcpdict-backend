import { Module } from '@nestjs/common';
import { CeshiController } from './ceshi.controller';
import { CeshiService } from './ceshi.service';

@Module({
  controllers: [CeshiController],
  providers: [CeshiService]
})
export class CeshiModule {}
