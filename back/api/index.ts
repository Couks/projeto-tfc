import serverless from 'serverless-http';
import { expressApp, createApp } from '../src/bootstrap';
import type { Request, Response } from 'express';

let cached: serverless.Handler | null = null;

export default async function handler(req: Request, res: Response) {
  if (!cached) {
    await createApp();
    cached = serverless(expressApp); // transforma o Express em handler serverless
  }
  return cached(req, res);
}
