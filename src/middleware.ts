import {
  getBaseAuthData,
  createAuthCookie,
  getResWithXHeaders,
} from './lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const authUrls = ['/signin', '/signup'];

export default async function middleware(req: NextRequest) {
  const { user } = await getBaseAuthData();

  const isAuthUrl = authUrls.includes(req.nextUrl.pathname);

  if (!user && !isAuthUrl) {
    return NextResponse.redirect(new URL('/signin', req.nextUrl), {
      headers: { 'Set-Cookie': createAuthCookie('', 0) }, // Clear auth cookie, if exist
      status: 303,
    });
  }

  if (user && isAuthUrl) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return getResWithXHeaders(req, NextResponse.next());
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|[^/]*\\.(?:.ico|svg|png|jpg|jpeg)$).*)',
  ],
};
