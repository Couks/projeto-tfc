import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Options,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { SdkService } from './sdk.service';
import { readFileSync } from 'fs';
import { join } from 'path';

@ApiTags('SDK')
@Controller('sdk')
export class SdkController {
  constructor(private readonly sdkService: SdkService) {}

  /**
   * Retorna configuração do site para o SDK
   * @param site Chave do site
   * @param res Resposta Express
   * @returns Objeto de configuração do site
   */
  @Get('site-config')
  @ApiOperation({
    summary: 'Obter configuração do site para SDK',
    description:
      'Retorna a configuração do site necessária para inicializar o SDK JavaScript.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração do site retornada com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async getSiteConfig(@Query('site') site: string, @Res() res: Response) {
    const config = await this.sdkService.getSiteConfig(site);

    // Define cabeçalhos CORS para requisições de outros domínios
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    res.status(HttpStatus.OK).json(config);
  }

  /**
   * Retorna o JavaScript loader do SDK
   * @param site Chave do site
   * @param res Resposta Express
   */
  @Get('loader')
  @ApiOperation({
    summary: 'Obter script de carregamento do SDK',
    description:
      'Retorna o script JavaScript de carregamento do SDK para o site especificado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Script de carregamento do SDK retornado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async getLoader(@Query('site') site: string, @Res() res: Response) {
    const script = await this.sdkService.getLoader(site);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send(script);
  }

  /**
   * Responde às requisições OPTIONS para pré-vérificação CORS do loader
   * @param res Resposta Express
   */
  @Options('loader')
  @ApiExcludeEndpoint()
  handleLoaderOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }

  /**
   * Responde às requisições OPTIONS para pré-vérificação CORS do site-config
   * @param res Resposta Express
   */
  @Options('site-config')
  @ApiExcludeEndpoint()
  handleSiteConfigOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }

  /**
   * Serve o arquivo capture-filters.js diretamente
   * @param res Resposta Express
   */
  @Get('capture-filters.js')
  @ApiOperation({
    summary: 'Servir arquivo capture-filters.js',
    description:
      'Retorna o arquivo JavaScript capture-filters.js para rastreamento de eventos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo capture-filters.js retornado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado.' })
  serveCaptureFilters(@Res() res: Response) {
    try {
      // Tenta encontrar o arquivo em caminhos diferentes
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
          // Tenta o próximo caminho
        }
      }

      if (!found) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: 'Arquivo não encontrado',
          triedPaths: possiblePaths,
        });
        return;
      }

      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status(HttpStatus.OK).send(fileContent);
    } catch {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Erro interno no servidor' });
    }
  }

  /**
   * Responde às requisições OPTIONS para capture-filters.js
   * @param res Resposta Express
   */
  @Options('capture-filters.js')
  @ApiExcludeEndpoint()
  handleCaptureFiltersOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(HttpStatus.OK).send();
  }
}
