import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';

@Injectable()
export class YongFaService {
  constructor(private prisma: PrismaProvider) { }

}
