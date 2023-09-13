import { Module } from '@nestjs/common';
import { YongFaService } from './yong-fa.service';
import { YongFaController } from './yong-fa.controller';

@Module({
  providers: [YongFaService],
  controllers: [YongFaController]
})
export class YongFaModule {}
