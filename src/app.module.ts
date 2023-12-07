import { Global, Module } from '@nestjs/common';
import { PrismaProvider } from './providers/prisma.provider';
import { ProviderModule } from './providers/providers.module';
import { CeshiModule } from './modules/ceshi/ceshi.module';
import { ZiModule } from './modules/zi/zi.module';
import { FangYanModule } from './modules/fang-yan/fang-yan.module';
import { UserModule } from './modules/user/user.module';
import { DuYinModule } from './modules/du-yin/du-yin.module';
import { YongFaModule } from './modules/yong-fa/yong-fa.module'; 
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./utils/constants";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";
import { ResponseInterceptor } from "src/interceptors/response.interceptor";
import {AppController} from './app.controller'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    ProviderModule,
    CeshiModule,
    ZiModule,
    FangYanModule,
    UserModule,
    DuYinModule,
    YongFaModule, 
  ],
  controllers: [
    AppController
  ],
  providers: [
    // https://docs.nestjs.com/security/authentication#enable-authentication-globally
    // NestJS自动绑定AuthGuard到所有接口，不需要验证的接口启动@public装饰器
    { 
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    { 
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ],
})
export class AppModule {
  constructor() {

  }
}
