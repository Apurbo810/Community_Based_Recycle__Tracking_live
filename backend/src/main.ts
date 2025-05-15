import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors();

  // ✅ Use the PORT Render provides AND bind to 0.0.0.0
  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0'); // ✅ This is REQUIRED for Render to access the app
}
bootstrap();
