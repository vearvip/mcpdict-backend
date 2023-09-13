import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';

@Injectable()
export class DuYinService {
  constructor(private prisma: PrismaProvider) { }

}
