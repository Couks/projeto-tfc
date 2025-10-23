import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SdkService {
  private readonly logger = new Logger(SdkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves site configuration for SDK
   * @param siteKey Site key
   * @returns Site configuration
   */
  async getSiteConfig(siteKey: string) {
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      include: {
        domains: {
          select: { host: true },
        },
        settings: {
          select: { key: true, value: true },
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    if (site.status !== 'active') {
      throw new NotFoundException('Site is not active');
    }

    // Get API host from config
    const apiHost = this.configService.get<string>('api.baseUrl');

    // Convert settings array to object
    const settingsObj = site.settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      siteKey: site.siteKey,
      allowedDomains: site.domains.map((d) => d.host),
      apiHost,
      consentDefault: settingsObj.consentDefault || 'opt-out',
      settings: settingsObj,
    };
  }

  /**
   * Generates SDK loader script
   * @param siteKey Site key
   * @returns JavaScript loader code
   */
  async getLoader(siteKey: string) {
    // Verify site exists
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true, status: true },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    if (site.status !== 'active') {
      throw new NotFoundException('Site is not active');
    }

    const apiHost = this.configService.get<string>('api.baseUrl');

    // Generate loader script
    const loaderScript = `
(function() {
  'use strict';

  var SITE_KEY = '${siteKey}';
  var API_URL = '${apiHost}';

  // Check if already loaded
  if (window.__INSIGHTHOUSE_LOADED__) {
    console.warn('InsightHouse SDK already loaded');
    return;
  }
  window.__INSIGHTHOUSE_LOADED__ = true;

  // Fetch site configuration
  fetch(API_URL + '/api/sdk/site-config?site=' + SITE_KEY)
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load site config');
      return res.json();
    })
    .then(function(config) {
      // Validate domain
      var currentHost = window.location.hostname.toLowerCase();
      var allowed = config.allowedDomains.map(function(d) { return d.toLowerCase(); });

      if (allowed.indexOf(currentHost) === -1) {
        console.warn('InsightHouse: Domain not allowed:', currentHost);
        return;
      }

      // Store config globally
      window.__INSIGHTHOUSE_CONFIG__ = config;

      // Load main SDK script from backend static files
      // O arquivo capture-filters.js é servido diretamente do backend
      var script = document.createElement('script');
      script.src = API_URL + '/static/capture-filters.js';
      script.async = true;
      script.onload = function() {
        console.log('InsightHouse SDK loaded successfully');
      };
      script.onerror = function() {
        console.error('Failed to load InsightHouse SDK');
      };
      document.head.appendChild(script);
    })
    .catch(function(err) {
      console.error('InsightHouse initialization error:', err);
    });
})();
`;

    this.logger.log(`Loader generated for site: ${siteKey}`);

    return loaderScript;
  }
}
