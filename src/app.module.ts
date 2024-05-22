import { Global, Module } from '@nestjs/common'; 
import { ProviderModule } from './providers/providers.module';
// import { CeshiModule } from './modules/ceshi/ceshi.module';
// import { ZiModule } from './modules/zi/zi.module';
// import { FangYanModule } from './modules/fang-yan/fang-yan.module';
// import { UserModule } from './modules/user/user.module';
// import { DuYinModule } from './modules/du-yin/du-yin.module';
// import { YongFaModule } from './modules/yong-fa/yong-fa.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from "./filters/http-exception.filter";
import { CharacterModule } from './modules/character/character.module';

@Module({
  imports: [ 
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    ProviderModule,
    CharacterModule,
    // CeshiModule,
    // ZiModule,
    // FangYanModule,
    // UserModule,
    // DuYinModule,
    // YongFaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // https://docs.nestjs.com/security/authentication#enable-authentication-globally
    // NestJS自动绑定AuthGuard到所有接口，不需要验证的接口启动@public装饰器
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    }, 
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  constructor() {}
}
