import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';
import { notEmptyArr } from 'src/utils';

@Injectable()
export class FangYanService {
  constructor(private prisma: PrismaProvider) { }

  async findYangYans({ 
    ids, 
  }: { 
    ids?: number[] 
  }) {
    let OrParams = []

    if (notEmptyArr(ids)) {
      OrParams = ids.map(id => ({ id }))
    }  
     

    return this.prisma.fangYan.findMany({ 
      where: {
        OR: notEmptyArr(OrParams) ? OrParams : undefined, 
      }
    })
  }
  async findYangYanAll({ 
    id, 
  }: { 
    id: number 
  }) { 

    return this.prisma.fangYan.findFirst({ 
      include: {
        zis: {
          include: {
            duYins: {
              include: {
                yongFas: true
              }
            }
          }
        }
      },
      where: {
        AND: {
          id
        }
      }
    })
  }
}
