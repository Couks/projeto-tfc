import { cookies } from 'next/headers';

export type Session = { userId: string } | null;

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const v = store.get('admin_session')?.value;
  if (!v) return null;
  try {
    const parsed = JSON.parse(v) as { userId: string };
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}


