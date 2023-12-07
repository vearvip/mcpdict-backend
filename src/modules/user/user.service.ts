import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaProvider } from 'src/providers/prisma.provider';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaProvider,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    // const payload = { sub: user.id, username: user.email };

    return {
      token: await this.jwtService.signAsync(user),
    };
  }
}
