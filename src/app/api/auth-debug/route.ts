import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const tokenWithReq = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch(e) {
    console.error(e);
  }

  return NextResponse.json({
    hasTokenWithReq: !!tokenWithReq,
    hasSession: !!session,
    cookies: allCookies.map(c => c.name),
    headers: Object.fromEntries(req.headers.entries()),
    env: {
      hasUrl: !!process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    }
  });
}
