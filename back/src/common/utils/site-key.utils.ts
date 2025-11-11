import { customAlphabet } from 'nanoid';

// Gera uma chave única para o site
export function generateSiteKey(): string {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);
  return `sk_${nanoid()}`;
}

// Valida se o domínio é FQDN válido
export function isValidFqdn(domain: string): boolean {
  const regex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return regex.test(domain);
}
