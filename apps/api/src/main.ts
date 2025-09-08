import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';

dotenv.config();                // .env
dotenv.config({ path: '.env.local' }); // override ב־dev

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn'] });
  app.use(cookieParser());
  app.setGlobalPrefix('api');   // <<< חשוב: מתאים ל־rewrites של Next
console.log('✅ Global prefix set to: api');

  app.enableCors({
    origin: ['http://localhost:3000','http://localhost:3001' , 'https://all-in-one-eed0a.web.app',
    'https://all-in-one-eed0a.firebaseapp.com' /*+ הוסיפי דומיינים לפרוד*/],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','x-org-id'],
    credentials: true,
  });
  const server = app.getHttpAdapter().getHttpServer();
  console.log('Routes registered:');
  console.log(server._events); // hacky אבל מראה מה רשום

  app.use(
    '/uploads/properties',
    express.static(path.join(process.cwd(), 'tmp', 'uploads', 'properties'))
  );

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
