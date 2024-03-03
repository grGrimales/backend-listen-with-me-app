import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';



async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);




  // Enable CORS
  const corsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:3000', 'https://listen-with-me-app.vercel.app'],
    credentials: true,
  };
  app.enableCors(
    corsOptions,
  );
  // Enable Validation
    app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
