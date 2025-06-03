import { NextRequest, NextResponse } from 'next/server';
import {
  signoutAndRedirect,
  getResWithXHeaders,
  getSignedInUser,
} from './lib/auth';

const authUrls = ['/signin', '/signup'];

export default async function middleware(req: NextRequest) {
  const user = await getSignedInUser();

  const isAuthUrl = authUrls.includes(req.nextUrl.pathname);

  if (!user && !isAuthUrl) {
    return signoutAndRedirect(req, '/signin');
  }

  if (user && isAuthUrl) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return getResWithXHeaders(req, NextResponse.next(), user);
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|[^/]*\\.(?:.ico|svg|png|jpg|jpeg)$).*)',
  ],
};
