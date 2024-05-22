import { Injectable } from '@nestjs/common';
import { PrismaProvider } from 'src/providers/prisma.provider';

@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaProvider) {}

  async queryCharacterPronunciationsGroupedByDialect(char: string) {
    const character = await this.prisma.character.findUnique({
      where: {
        codePoint: char.codePointAt(0),
      },
      include: {
        pronunciations: {
          include: {
            dialect: true,
          },
        },
      },
    });

    if (!character) {
      return null; // or handle as required
    }

    const groups = character.pronunciations.reduce((acc, pronunciation) => {
      const dialectName = pronunciation.dialect.name;
      // 查找当前方言在累加器数组中的位置
      let group = acc.find((g) => g.dialectName === dialectName);
      if (!group) {
        // 如果没有找到对应方言的组，则创建新的组
        group = { dialectName, pronunciations: [] };
        acc.push(group);
      }
      // 将读音添加到对应的组中
      group.pronunciations.push(pronunciation);
      return acc;
    }, []);

    return groups;
  }
}
