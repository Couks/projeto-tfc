import { cookies } from 'next/headers';
import crypto from "crypto";

export type Session = { userId: string } | null;

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || "";
  if (!s) return "dev-secret-do-not-use-in-prod";
  return s;
}

function sign(value: string): string {
  const h = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
  return `${value}.${h}`;
}

function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const lastDot = signed.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const raw = signed.slice(0, lastDot);
  const sig = signed.slice(lastDot + 1);
  const check = crypto
    .createHmac("sha256", getSecret())
    .update(raw)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(check))
    ? raw
    : null;
}

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const v = store.get("admin_session")?.value;
  if (!v) return null;
  try {
    const raw = verify(v);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId: string };
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}

export function createSignedSessionCookie(value: { userId: string }): string {
  return sign(JSON.stringify(value));
}

// Password hashing using scrypt (built-in, no external deps)
export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const N = 16384,
    r = 8,
    p = 1,
    keylen = 64; // moderate parameters
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plain, salt, keylen, { N, r, p }, (err, buf) => {
      if (err) reject(err);
      else resolve(buf as Buffer);
    });
  });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString(
    "base64"
  )}`;
}

export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  try {
    const [scheme, sN, sr, sp, sSalt, sHash] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = parseInt(sN, 10),
      r = parseInt(sr, 10),
      p = parseInt(sp, 10);
    const salt = Buffer.from(sSalt, "base64");
    const expected = Buffer.from(sHash, "base64");
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


