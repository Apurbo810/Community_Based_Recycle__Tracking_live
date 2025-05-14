import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors();

  // ✅ Use the PORT environment variable (required by Render)
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
