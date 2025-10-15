import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("[Auth][Logout] request received");
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  console.log("[Auth][Logout] cleared cookie & redirect");
  return res;
}


