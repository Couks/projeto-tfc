import * as crypto from 'crypto';

/**
 * Hashes a password using scrypt
 * @param plain Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const N = 16384;
  const r = 8;
  const p = 1;
  const keylen = 64;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plain, salt, keylen, { N, r, p }, (err, buf) => {
      if (err) reject(err);
      else resolve(buf as Buffer);
    });
  });

  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Verifies a password against a stored hash
 * @param plain Plain text password
 * @param stored Stored hash
 * @returns True if password matches
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  try {
    const [scheme, sN, sr, sp, sSalt, sHash] = stored.split('$');

    if (scheme !== 'scrypt') return false;

    const N = parseInt(sN, 10);
    const r = parseInt(sr, 10);
    const p = parseInt(sp, 10);
    const salt = Buffer.from(sSalt, 'base64');
    const expected = Buffer.from(sHash, 'base64');
    const keylen = expected.length;

    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(plain, salt, keylen, { N, r, p }, (err, buf) => {
        if (err) reject(err);
        else resolve(buf as Buffer);
      });
    });

    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Signs a session value with HMAC
 * @param value Session data
 * @param secret Secret key
 * @returns Signed session string
 */
export function signSession(value: { userId: string }, secret: string): string {
  const raw = JSON.stringify(value);
  const hmac = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return `${raw}.${hmac}`;
}
