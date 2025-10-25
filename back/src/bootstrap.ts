import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';

export const expressApp: Express = express();

export async function createApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  await app.init(); // importante em serverless
  return app;
}
