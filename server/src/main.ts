import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env before anything else
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS: Allow your frontend origin in production!
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files (uploads/images) - BEFORE global prefix
  const uploadsPath = join(__dirname, '..', '..', 'uploads');

  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // (Optional but good): Global request validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: false, // Set true for strict mode
      transform: true,
    }),
  );

  // Listen on your configured port
  const port = process.env.PORT || 3001;
  await app.listen(port);

}

bootstrap();
