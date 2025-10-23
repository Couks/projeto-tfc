import crypto from 'node:crypto';

export function generateSiteKey(): string {
  const raw = crypto.randomBytes(12).toString('hex');
  return `site_${raw}`;
}

export function isValidFqdn(host: string): boolean {
  // Basic FQDN validation (no protocol, no path)
  return /^[a-zA-Z0-9.-]+$/.test(host) && host.includes('.') && !host.endsWith('.');
}


