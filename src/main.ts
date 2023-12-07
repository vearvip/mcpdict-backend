// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'; 

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // await app.register(import('@fastify/rate-limit'), {
  //   max: 100, // 允许每个 IP 每分钟最多 100 个请求
  //   timeWindow: '1 minute',
  //   keyGenerator: (req) => {
  //     console.log('req', req.headers)
  //     // 取 X-Forwarded-For 或 X-Real-IP 请求头中的地址作为客户端的真实地址
  //     return (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip) as any;
  //   },
  // });


  await app.enableCors({
    origin: '*',
  });

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
