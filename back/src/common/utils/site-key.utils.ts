import { customAlphabet } from 'nanoid';

/**
 * Generates a unique site key
 * @returns Site key string
 */
export function generateSiteKey(): string {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);
  return `sk_${nanoid()}`;
}

/**
 * Validates FQDN format
 * @param domain Domain name
 * @returns True if valid FQDN
 */
export function isValidFqdn(domain: string): boolean {
  const regex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return regex.test(domain);
}
