import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Auth][Logout] request received');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', '', { httpOnly: true, path: '/', expires: new Date(0) });
  console.log('[Auth][Logout] cleared cookie');
  return res;
}


