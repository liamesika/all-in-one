import { NestFactory } from '@nestjs/core';
import { MinimalAppModule } from './minimal-app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(MinimalAppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });
  
  // Increase payload size limits for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Static file serving for uploaded property photos
  app.use(
    '/uploads/properties',
    express.static(path.join(process.cwd(), 'tmp', 'uploads', 'properties'))
  );
  
  await app.listen(4000);
  console.log('🚀 Minimal API server running on http://localhost:4000');
}

bootstrap();