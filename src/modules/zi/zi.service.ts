import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';
import { notEmptyArr } from 'src/utils';

@Injectable()
export class ZiService {
  constructor(private prisma: PrismaProvider) { }

  async findZis({
    zis,
    ids,
    fangYanIds
  }: {
    zis?: string[]
    ids?: number[]
    fangYanIds: number[]
  }) {
    let OrParams = []

    if (notEmptyArr(ids)) {
      OrParams = ids.map(id => ({ id }))
    }
    if (notEmptyArr(zis)) {
      OrParams = [
        ...OrParams,
        ...zis.map(zi => ({ zi }))
      ]
    }

    let AndParams = []

    if (notEmptyArr(fangYanIds)) {
      AndParams = fangYanIds.map(fangYanId => ({ fangYanId }))
    } 
    
    // console.log({
    //   OrParams,
    //   AndParams
    // })

    return this.prisma.zi.findMany({
      include: {
        fangYan: true,
        duYins: {
          include: {
            yongFas: true
          }
        },
      },
      where: {
        OR: notEmptyArr(OrParams) ? OrParams : undefined,
        AND: notEmptyArr(AndParams) ? AndParams : undefined,  
      }
    })
  }
  async findArticle({
    zis, 
    fangYanIds
  }: {
    zis?: string[] 
    fangYanIds: number[]
  }) {
    let OrParams = []
 
    if (notEmptyArr(zis)) {
      OrParams = [
        ...OrParams,
        ...zis.map(zi => ({ zi }))
      ]
    }

    let AndParams = []

    if (notEmptyArr(fangYanIds)) {
      AndParams = fangYanIds.map(fangYanId => ({ fangYanId }))
    } 
     

    return this.prisma.zi.findMany({
      include: { 
        duYins: true,
      },
      where: {
        OR: notEmptyArr(OrParams) ? OrParams : undefined,
        AND: notEmptyArr(AndParams) ? AndParams : undefined,  
      }
    })
  }
}
