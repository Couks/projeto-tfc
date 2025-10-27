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

@Controller('sdk')
export class SdkController {
  constructor(private readonly sdkService: SdkService) {}

  /**
   * Returns site configuration for SDK
   * @param site Site key
   * @returns Site configuration object
   */
  @Get('site-config')
  async getSiteConfig(@Query('site') site: string) {
    return this.sdkService.getSiteConfig(site);
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
  handleOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }
}
