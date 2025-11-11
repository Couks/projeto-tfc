import * as crypto from 'crypto';

/**
 * Gera hash da senha usando scrypt
 * @param plain Senha em texto simples
 * @returns Hash da senha como string
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16); // Gera um salt aleatório
  const N = 16384;
  const r = 8;
  const p = 1;
  const keylen = 64;

  // Deriva o hash da senha com scrypt
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plain, salt, keylen, { N, r, p }, (err, buf) => {
      if (err) reject(err);
      else resolve(buf as Buffer);
    });
  });

  // Retorna os parâmetros e o hash como string
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Verifica se a senha está correta comparando com o hash salvo
 * @param plain Senha em texto simples
 * @param stored Hash salvo
 * @returns True se a senha for igual
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  try {
    // Extrai os parâmetros do hash salvo
    const [scheme, sN, sr, sp, sSalt, sHash] = stored.split('$');

    if (scheme !== 'scrypt') return false; // Verifica se é o esquema esperado

    const N = parseInt(sN, 10);
    const r = parseInt(sr, 10);
    const p = parseInt(sp, 10);
    const salt = Buffer.from(sSalt, 'base64');
    const expected = Buffer.from(sHash, 'base64');
    const keylen = expected.length;

    // Deriva o hash da senha digitada
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(plain, salt, keylen, { N, r, p }, (err, buf) => {
        if (err) reject(err);
        else resolve(buf as Buffer);
      });
    });

    // Compara o hash calculado com o salvo
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    // Retorna falso se ocorrer algum erro
    return false;
  }
}
