import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  DevicesResponse,
  DevicesTimeSeriesResponse,
} from '../interfaces/insights.interface';

@Injectable()
export class OverviewService {
  private readonly logger = new Logger(OverviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula o intervalo de datas baseado no filtro selecionado.
   */
  private getDateRange(
    dateFilter?: DateFilter,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();

    // Se o filtro for personalizado, usa as datas fornecidas
    if (dateFilter === DateFilter.CUSTOM && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    // Filtro para o dia atual
    if (dateFilter === DateFilter.DAY) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    // Filtro para semana atual (de domingo até sábado)
    if (dateFilter === DateFilter.WEEK) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    // Filtro para o mês atual
    if (dateFilter === DateFilter.MONTH) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    // Filtro para o ano atual
    if (dateFilter === DateFilter.YEAR) {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    // Padrão: últimos 30 dias
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Retorna a lista de dispositivos agrupados por tipo, sistema, e navegador.
   */
  async getDevices(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
    // Busca o site pelo siteKey
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    // Se o site não existir, lança exceção
    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    // Pega o intervalo de datas filtrado
    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Consulta agregada extraindo device_type, os e browser do userAgent no context
    // Usa regex (~*) para melhor performance e precisão
    const devices = await this.prisma.$queryRaw<
      Array<{
        device_type: string;
        os: string;
        browser: string;
        count: bigint;
      }>
    >`
      SELECT
        CASE
          WHEN context->>'userAgent' ~* '(bot|crawler|spider|facebookexternalhit|Slackbot|WhatsApp)'
            THEN 'bot'
          WHEN (context->>'userAgent' ~* '(iPhone|IEMobile|Windows Phone|Mobi|Mobile)')
             OR (context->>'userAgent' ~* 'Android' AND context->>'userAgent' ~* 'Mobile')
             OR (context->>'userAgent' ~* '(iPad|Tablet)')
            THEN 'mobile'
          ELSE 'desktop'
        END as device_type,
        CASE
          WHEN context->>'userAgent' ~* 'Android[ /]([0-9][0-9\.]*)' THEN 'Android'
          WHEN context->>'userAgent' ~* '(iPhone|iPad|iPod).*OS [0-9_]+' THEN 'iOS'
          WHEN context->>'userAgent' ~* 'Windows NT [0-9]' THEN 'Windows'
          WHEN context->>'userAgent' ~* 'Mac OS X' OR context->>'userAgent' ~* 'Macintosh' THEN 'macOS'
          WHEN context->>'userAgent' ~* 'Linux' THEN 'Linux'
          ELSE 'Unknown'
        END as os,
        CASE
          WHEN context->>'userAgent' ~* 'EdgA?/[0-9]' THEN 'Edge'
          WHEN context->>'userAgent' ~* '(OPR|Opera)/[0-9]' THEN 'Opera'
          WHEN context->>'userAgent' ~* 'SamsungBrowser/[0-9]' THEN 'Samsung Internet'
          WHEN context->>'userAgent' ~* 'FxiOS/[0-9]' THEN 'Firefox iOS'
          WHEN context->>'userAgent' ~* 'Firefox/[0-9]' THEN 'Firefox'
          WHEN context->>'userAgent' ~* 'CriOS/[0-9]' THEN 'Chrome iOS'
          WHEN context->>'userAgent' ~* 'Chrome/[0-9]' AND context->>'userAgent' !~* 'Edg|OPR|SamsungBrowser' THEN 'Chrome'
          WHEN context->>'userAgent' ~* 'Version/[0-9].*Safari' THEN 'Safari'
          WHEN context->>'userAgent' ~* 'Safari/[0-9]' THEN 'Safari'
          ELSE 'Unknown'
        END as browser,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND context->>'userAgent' IS NOT NULL
      GROUP BY device_type, os, browser
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Retorna os dados já transformados
    return {
      devices: devices.map((d) => ({
        deviceType: d.device_type,
        os: d.os,
        browser: d.browser,
        count: Number(d.count),
      })),
    };
  }

  /**
   * Retorna a série temporal diária de dispositivos (mobile/desktop)
   */
  async getDevicesTimeSeries(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DevicesTimeSeriesResponse> {
    // Busca o site pelo siteKey
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    // Se o site não existir, lança exceção
    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    // Pega o intervalo de datas filtrado
    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    const timeSeries = await this.prisma.$queryRaw<
      Array<{
        date: Date;
        device_type: string;
        count: bigint;
      }>
    >`
      SELECT
        DATE(ts) as date,
        CASE
          WHEN (context->>'userAgent' ~* '(iPhone|IEMobile|Windows Phone|Mobi|Mobile)')
             OR (context->>'userAgent' ~* 'Android' AND context->>'userAgent' ~* 'Mobile')
             OR (context->>'userAgent' ~* '(iPad|Tablet)')
            THEN 'mobile'
          ELSE 'desktop'
        END as device_type,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND context->>'userAgent' IS NOT NULL
        AND context->>'userAgent' !~* '(bot|crawler|spider|facebookexternalhit|Slackbot|WhatsApp)'
      GROUP BY DATE(ts), device_type
      ORDER BY date ASC, device_type
    `;

    // Mapa para agrupar os resultados por data
    const dataMap = new Map<string, { mobile: number; desktop: number }>();

    timeSeries.forEach((row) => {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { mobile: 0, desktop: 0 });
      }
      const entry = dataMap.get(dateKey)!;
      // Agrupa mobile e tablet como mobile, exclui bots (já filtrados no WHERE)
      if (row.device_type === 'mobile') {
        entry.mobile = Number(row.count);
      } else if (row.device_type === 'desktop') {
        entry.desktop = Number(row.count);
      }
    });

    // Transforma o mapa em array ordenada por data
    const data = Array.from(dataMap.entries())
      .map(([date, counts]) => ({
        date,
        mobile: counts.mobile,
        desktop: counts.desktop,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Retorna série temporal e período usado
    return {
      data,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
