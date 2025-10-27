import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Options,
} from '@nestjs/common';
import type { Response } from 'express';
import { SdkService } from './sdk.service';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('sdk')
export class SdkController {
  constructor(private readonly sdkService: SdkService) {}

  /**
   * Returns site configuration for SDK
   * @param site Site key
   * @param res Express response
   * @returns Site configuration object
   */
  @Get('site-config')
  async getSiteConfig(@Query('site') site: string, @Res() res: Response) {
    const config = await this.sdkService.getSiteConfig(site);

    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    res.status(HttpStatus.OK).json(config);
  }

  /**
   * Returns SDK loader JavaScript
   * @param site Site key
   * @param res Express response
   */
  @Get('loader')
  async getLoader(@Query('site') site: string, @Res() res: Response) {
    const script = await this.sdkService.getLoader(site);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem para o SDK
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send(script);
  }

  /**
   * Handle OPTIONS requests for CORS preflight
   * @param res Express response
   */
  @Options('loader')
  handleLoaderOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }

  /**
   * Handle OPTIONS requests for site-config CORS preflight
   * @param res Express response
   */
  @Options('site-config')
  handleSiteConfigOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }

  /**
   * Serve the capture-filters.js file directly
   * @param res Express response
   */
  @Get('capture-filters.js')
  serveCaptureFilters(@Res() res: Response) {
    try {
      // Try multiple possible paths
      const possiblePaths = [
        join(__dirname, '..', '..', 'public', 'static', 'capture-filters.js'),
        join(
          __dirname,
          '..',
          '..',
          '..',
          'public',
          'static',
          'capture-filters.js',
        ),
        join(process.cwd(), 'public', 'static', 'capture-filters.js'),
        join(process.cwd(), 'dist', 'public', 'static', 'capture-filters.js'),
      ];

      let fileContent = '';
      let found = false;

      for (const filePath of possiblePaths) {
        try {
          fileContent = readFileSync(filePath, 'utf8');
          found = true;
          break;
        } catch {
          // Try next path
        }
      }

      if (!found) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: 'File not found',
          triedPaths: possiblePaths,
        });
        return;
      }

      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status(HttpStatus.OK).send(fileContent);
    } catch {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle OPTIONS requests for capture-filters.js
   * @param res Express response
   */
  @Options('capture-filters.js')
  handleCaptureFiltersOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }
}
