import { Global, Module } from '@nestjs/common'; 
import { PrismaProvider } from './prisma.provider';

@Global()
@Module({
  controllers: [],
  providers: [PrismaProvider],
  exports: [PrismaProvider],
})
export class ProviderModule {}
