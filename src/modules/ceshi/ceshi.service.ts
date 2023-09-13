import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';
import * as originDatabase from './origin.json'; 

import { FangYan, User, Zi } from '@prisma/client';
import { notEmptyArr } from 'src/utils';

function fmtData(databaseObj) {
  const obj = {};

  for (const fangYanMingZi in databaseObj) {
    const zis = databaseObj[fangYanMingZi];
    const ziObj = {};
    zis.forEach((infoStr) => {
      const infoList = infoStr.split('#');
      const zi = infoList[0];
      const yinBiao = infoList[1];
      const shiYi = infoList[2];
      if (zi in ziObj) {
        const duYin = ziObj[zi].find((ele) => ele.yinBiao === yinBiao);
        if (duYin) {
          if (notEmptyArr(duYin.yongFas) && shiYi) {
            duYin.yongFas.push({ shiYi });
          } else {
            duYin.yongFas = shiYi ? [{ shiYi }] : undefined;
          }
        } else {
          ziObj[zi].push({
            yinBiao,
            yongFas: shiYi ? [{ shiYi }] : undefined,
          });
        }
      } else {
        ziObj[zi] = [
          {
            yinBiao,
            yongFas: shiYi ? [{ shiYi }] : undefined,
          },
        ];
      }
    });

    obj[fangYanMingZi] = ziObj;
  }

  return obj;
}
@Injectable()
export class CeshiService {
  constructor(private prisma: PrismaProvider) {}

  async queryUsers(params?: User) {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        // role: true,
      },
    });
  }
  async queryZis(zi?: string,pageNum: number = 1,pageSize = 20) {
    return this.prisma.zi.findMany({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      include: {
        // fangYan: true,
        // duYins: true,
      },
      where: {
        zi, 
      },
    }); 
  }
  async queryFangYans(params?: FangYan) {
    return this.prisma.fangYan.findMany({
      include: {
        zis: {
          include: {
            duYins: true,
          },
        },
      },
    });
  }

  async juen2() {
    const result = await this.prisma.fangYan.create({
      data: {
        mingZi: '贝贝',
        zis: {
          create: [
            {
              zi: '是',
              duYins: {
                create: [
                  {
                    yinBiao: 'shi5',
                    yongFas: {
                      create: [
                        {
                          shiYi: 'xxxxx',
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              zi: '就',
            },
          ],
        },
      },
    });
    return result;
  }
  async juen3() {
    const result = await this.prisma.fangYan.create({
      data: {
        mingZi: '贝贝',
        zis: {
          create: [
            {
              zi: '是',
            },
            {
              zi: '就',
            },
          ],
        },
      },
    });
    return result;
  }

  async juen() {
    const database = fmtData(originDatabase);
    // console.log('database', database);
    const fangyans = [];
    let errorList = []
    for (const fangYanMingZi in database) {
      const ziObj = database[fangYanMingZi];
      const zis = [];
      for (const zi in ziObj) {
        const duYins = ziObj[zi].map((ele) => {
          return {
            yinBiao: ele.yinBiao,
            yongFas: ele.yongFas
              ? {
                  create: ele.yongFas,
                }
              : undefined,
          };
        });
        zis.push({
          zi,
          duYins: {
            create: duYins,
          },
        });
      }

      // console.log('fangyan', fangyan)
      try {
        
        const result = await this.prisma.fangYan.create({
          data: {
            mingZi: fangYanMingZi,
            zis: {
              create: zis,
            },
          },
        });
        fangyans.push(result);
      } catch (error) {
        console.log('error', error)
        console.log('fangYanMingZi', fangYanMingZi)
        errorList.push(fangYanMingZi)
      }
    }
    return errorList;
  }
 
}
