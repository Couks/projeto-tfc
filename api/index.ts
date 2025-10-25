import serverless from 'serverless-http';
import { expressApp, createApp } from './back/src/bootstrap';
import type { Request, Response } from 'express';

let cached: serverless.Handler | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!cached) {
      console.log('Initializing NestJS app...');
      await createApp();
      cached = serverless(expressApp);
      console.log('NestJS app initialized successfully');
    }
    return cached(req, res);
  } catch (error) {
    console.error('Error in serverless handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
