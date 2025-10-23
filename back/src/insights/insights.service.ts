import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private readonly CACHE_TTL = 120000; // 2 minutes

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets cached data or executes query
   * @param cacheKey Cache key
   * @param queryFn Query function
   * @returns Cached or fresh data
   */
  private async getCached<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return cached.data as T;
    }

    this.logger.debug(`Cache miss: ${cacheKey}`);
    const data = await queryFn();

    this.cache.set(cacheKey, {
      data,
      expiresAt: now + this.CACHE_TTL,
    });

    // Clean expired cache entries
    if (this.cache.size > 1000) {
      this.cleanExpiredCache();
    }

    return data;
  }

  /**
   * Cleans expired cache entries
   */
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Gets overview analytics for a site
   * @param siteKey Site key
   * @returns Overview data with various metrics
   */
  async getOverview(siteKey: string) {
    const cacheKey = `overview:${siteKey}`;

    return this.getCached(cacheKey, async () => {
      // Verify site exists
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }

      // Run all queries in parallel
      const [
        finalidade,
        tipos,
        cidades,
        bairros,
        precoVendaRanges,
        precoAluguelRanges,
        areaRanges,
        dormitorios,
        suites,
        banheiros,
        vagas,
        flags,
      ] = await Promise.all([
        // Finalidade (purpose)
        this.prisma.$queryRaw<Array<{ finalidade: string; total: bigint }>>`
          SELECT properties->>'value' AS finalidade, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'finalidade'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Tipos (property types)
        this.prisma.$queryRaw<Array<{ tipo: string; total: bigint }>>`
          SELECT properties->>'value' AS tipo, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'tipo'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 20
        `,

        // Cidades (cities)
        this.prisma.$queryRaw<Array<{ cidade: string; total: bigint }>>`
          SELECT properties->>'cidade' AS cidade, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_city'
          GROUP BY properties->>'cidade'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Bairros (neighborhoods)
        this.prisma.$queryRaw<Array<{ bairro: string; total: bigint }>>`
          SELECT properties->>'bairro' AS bairro, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_bairro'
          GROUP BY properties->>'bairro'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Preço venda ranges (sale price ranges)
        this.prisma.$queryRaw<Array<{ range: string; total: bigint }>>`
          SELECT properties->>'value' AS range, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'input-slider-valor-venda'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Preço aluguel ranges (rent price ranges)
        this.prisma.$queryRaw<Array<{ range: string; total: bigint }>>`
          SELECT properties->>'value' AS range, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'input-slider-valor-aluguel'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Área ranges (area ranges)
        this.prisma.$queryRaw<Array<{ range: string; total: bigint }>>`
          SELECT properties->>'value' AS range, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'input-slider-area'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Dormitórios (bedrooms)
        this.prisma.$queryRaw<Array<{ valor: string; total: bigint }>>`
          SELECT properties->>'value' AS valor, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'dormitorios[]'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Suítes (suites)
        this.prisma.$queryRaw<Array<{ valor: string; total: bigint }>>`
          SELECT properties->>'value' AS valor, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'suites[]'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Banheiros (bathrooms)
        this.prisma.$queryRaw<Array<{ valor: string; total: bigint }>>`
          SELECT properties->>'value' AS valor, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'banheiros[]'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Vagas (parking spots)
        this.prisma.$queryRaw<Array<{ valor: string; total: bigint }>>`
          SELECT properties->>'value' AS valor, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' = 'vagas[]'
          GROUP BY properties->>'value'
          ORDER BY total DESC
          LIMIT 10
        `,

        // Flags (amenities/features)
        this.prisma.$queryRaw<Array<{ flag: string; total: bigint }>>`
          SELECT properties->>'field' AS flag, COUNT(*) AS total
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND name = 'search_filter_changed'
            AND properties->>'field' IN (
              'filtermobiliado', 'filterpet', 'filterpromocao',
              'filternovo', 'filternaplanta', 'filterconstrucao',
              'filterpermuta', 'filtersegfianca', 'filterproposta'
            )
          GROUP BY properties->>'field'
          ORDER BY total DESC
          LIMIT 20
        `,
      ]);

      // Convert BigInt to number for JSON serialization
      const toPairs = (data: Array<Record<string, unknown>>) =>
        data.map((item) => {
          const key = Object.values(item)[0] as string;
          const value = Number(Object.values(item)[1]);
          return [key, value];
        });

      return {
        finalidade: toPairs(finalidade),
        tipos: toPairs(tipos),
        cidades: toPairs(cidades),
        bairros: toPairs(bairros),
        preco_venda_ranges: toPairs(precoVendaRanges),
        preco_aluguel_ranges: toPairs(precoAluguelRanges),
        area_ranges: toPairs(areaRanges),
        dormitorios: toPairs(dormitorios),
        suites: toPairs(suites),
        banheiros: toPairs(banheiros),
        vagas: toPairs(vagas),
        flags: toPairs(flags),
      };
    });
  }

  /**
   * Gets conversion analytics for a site
   * @param siteKey Site key
   * @returns Conversion data
   */
  async getConversions(siteKey: string) {
    const cacheKey = `conversions:${siteKey}`;

    return this.getCached(cacheKey, async () => {
      // Verify site exists
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }

      // Get conversion events
      const conversions = await this.prisma.$queryRaw<
        Array<{ conversion_type: string; total: bigint }>
      >`
        SELECT
          CASE
            WHEN name = 'conversion_whatsapp_click' THEN 'whatsapp'
            WHEN name = 'conversion_phone_click' THEN 'phone'
            WHEN name = 'conversion_email_click' THEN 'email'
            WHEN name = 'conversion_form_submit' THEN 'form'
            ELSE name
          END AS conversion_type,
          COUNT(*) AS total
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name LIKE 'conversion_%'
        GROUP BY conversion_type
        ORDER BY total DESC
      `;

      // Get funnel data
      const funnel = await this.prisma.$queryRaw<
        Array<{ step: string; count: bigint }>
      >`
        SELECT
          step,
          COUNT(DISTINCT "sessionId") AS count
        FROM (
          SELECT
            "sessionId",
            CASE
              WHEN name = 'session_start' THEN 1
              WHEN name = 'search_submit' THEN 2
              WHEN name = 'property_page_view' THEN 3
              WHEN name LIKE 'conversion_%' THEN 4
            END AS step_order,
            CASE
              WHEN name = 'session_start' THEN 'Session Start'
              WHEN name = 'search_submit' THEN 'Search'
              WHEN name = 'property_page_view' THEN 'Property View'
              WHEN name LIKE 'conversion_%' THEN 'Conversion'
            END AS step
          FROM "Event"
          WHERE "siteKey" = ${siteKey}
            AND "sessionId" IS NOT NULL
            AND name IN ('session_start', 'search_submit', 'property_page_view')
            OR name LIKE 'conversion_%'
        ) AS funnel_steps
        WHERE step IS NOT NULL
        GROUP BY step, step_order
        ORDER BY step_order
      `;

      return {
        conversions: conversions.map((c) => ({
          type: c.conversion_type,
          count: Number(c.total),
        })),
        funnel: funnel.map((f) => ({
          step: f.step,
          count: Number(f.count),
        })),
      };
    });
  }

  /**
   * Gets user journey analytics for a site
   * @param siteKey Site key
   * @returns Journey data
   */
  async getJourneys(siteKey: string) {
    const cacheKey = `journeys:${siteKey}`;

    return this.getCached(cacheKey, async () => {
      // Verify site exists
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }

      // Get journey metrics
      const [pageDepth, scrollDepth, timeOnPage, returningVisitors] =
        await Promise.all([
          // Page depth distribution
          this.prisma.$queryRaw<Array<{ depth: number; count: bigint }>>`
            SELECT
              (properties->>'page_depth')::int AS depth,
              COUNT(*) AS count
            FROM "Event"
            WHERE "siteKey" = ${siteKey}
              AND name = 'page_view'
              AND properties->>'page_depth' IS NOT NULL
            GROUP BY depth
            ORDER BY depth
            LIMIT 20
          `,

          // Scroll depth distribution
          this.prisma.$queryRaw<Array<{ depth: number; count: bigint }>>`
            SELECT
              (properties->>'scroll_depth')::int AS depth,
              COUNT(*) AS count
            FROM "Event"
            WHERE "siteKey" = ${siteKey}
              AND name = 'scroll'
              AND properties->>'scroll_depth' IS NOT NULL
            GROUP BY depth
            ORDER BY depth
          `,

          // Time on page distribution
          this.prisma.$queryRaw<Array<{ range: string; count: bigint }>>`
            SELECT
              CASE
                WHEN (properties->>'time_on_page')::int < 10 THEN '0-10s'
                WHEN (properties->>'time_on_page')::int < 30 THEN '10-30s'
                WHEN (properties->>'time_on_page')::int < 60 THEN '30-60s'
                WHEN (properties->>'time_on_page')::int < 180 THEN '1-3min'
                ELSE '3min+'
              END AS range,
              COUNT(*) AS count
            FROM "Event"
            WHERE "siteKey" = ${siteKey}
              AND name = 'page_exit'
              AND properties->>'time_on_page' IS NOT NULL
            GROUP BY range
            ORDER BY
              CASE range
                WHEN '0-10s' THEN 1
                WHEN '10-30s' THEN 2
                WHEN '30-60s' THEN 3
                WHEN '1-3min' THEN 4
                ELSE 5
              END
          `,

          // Returning vs new visitors
          this.prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
            SELECT
              CASE
                WHEN properties->>'returning_visitor' = 'true' THEN 'returning'
                ELSE 'new'
              END AS type,
              COUNT(DISTINCT "sessionId") AS count
            FROM "Event"
            WHERE "siteKey" = ${siteKey}
              AND name = 'session_start'
              AND "sessionId" IS NOT NULL
            GROUP BY type
          `,
        ]);

      return {
        pageDepth: pageDepth.map((p) => ({
          depth: p.depth,
          count: Number(p.count),
        })),
        scrollDepth: scrollDepth.map((s) => ({
          depth: s.depth,
          count: Number(s.count),
        })),
        timeOnPage: timeOnPage.map((t) => ({
          range: t.range,
          count: Number(t.count),
        })),
        visitorType: returningVisitors.map((v) => ({
          type: v.type,
          count: Number(v.count),
        })),
      };
    });
  }

  /**
   * Gets top cities analytics for a site
   * @param siteKey Site key
   * @returns Top cities data
   */
  async getTopCities(siteKey: string) {
    const cacheKey = `top-cities:${siteKey}`;

    return this.getCached(cacheKey, async () => {
      // Verify site exists
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }

      const cities = await this.prisma.$queryRaw<
        Array<{ cidade: string; total: bigint }>
      >`
        SELECT properties->>'cidade' AS cidade, COUNT(*) AS total
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_filter_city'
          AND properties->>'cidade' IS NOT NULL
        GROUP BY properties->>'cidade'
        ORDER BY total DESC
        LIMIT 20
      `;

      return cities.map((c) => ({
        city: c.cidade,
        count: Number(c.total),
      }));
    });
  }

  /**
   * Clears cache for a specific site or all cache
   * @param siteKey Optional site key to clear specific cache
   */
  clearCache(siteKey?: string) {
    if (siteKey) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.includes(siteKey),
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
      this.logger.log(`Cache cleared for site: ${siteKey}`);
    } else {
      this.cache.clear();
      this.logger.log('All cache cleared');
    }
  }
}
