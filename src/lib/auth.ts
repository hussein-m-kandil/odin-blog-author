import logger from './logger';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthRes, User } from '@/types';

export const AUTH_COOKIE_KEY = 'authorization';

export async function getSignedInUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const Authorization = cookieStore.get(AUTH_COOKIE_KEY)?.value;
    if (Authorization) {
      const res = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
        headers: { 'Content-Type': 'application/json', Authorization },
        cache: 'no-store',
      });
      if (res.ok) return await res.json();
    }
  } catch (error) {
    logger.error('Error fetching signed-in user:', error);
  }
  return null;
}

export function createAuthCookie(value: string, maxAge = 7 * 24 * 60 * 60) {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const cookieKey = encodeURIComponent(AUTH_COOKIE_KEY);
  const cookieValue = encodeURIComponent(value);
  return `${cookieKey}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}; Max-Age=${maxAge}`;
}

export const getResWithXHeaders = (req: NextRequest, res: NextResponse) => {
  res.headers.set('x-pathname', req.nextUrl.pathname);
  res.headers.set('x-url', req.nextUrl.toString());
  return res;
};

export function signoutAndRedirect(
  req: NextRequest,
  redirectRelativeUrl = '/'
) {
  return NextResponse.redirect(new URL(redirectRelativeUrl, req.nextUrl), {
    headers: { 'Set-Cookie': createAuthCookie('', 0) }, // Clear auth cookie
    status: 303,
  });
}

export function signinAndRedirect(
  authRes: AuthRes,
  req: NextRequest,
  redirectRelativeUrl = '/'
) {
  const authCookie = createAuthCookie(authRes.token);
  const res = NextResponse.redirect(new URL(redirectRelativeUrl, req.nextUrl), {
    headers: { 'set-cookie': authCookie },
    status: 303,
  });
  return getResWithXHeaders(req, res);
}

export function isAuthRes(resData: unknown): resData is AuthRes {
  return (
    typeof resData === 'object' &&
    resData !== null &&
    'token' in resData &&
    typeof resData.token === 'string' &&
    'user' in resData &&
    typeof resData.user === 'object' &&
    resData.user !== null &&
    'id' in resData.user &&
    typeof resData.user.id === 'string' &&
    'username' in resData.user &&
    typeof resData.user.username === 'string' &&
    'fullname' in resData.user &&
    typeof resData.user.fullname === 'string' &&
    'isAdmin' in resData.user &&
    typeof resData.user.isAdmin === 'boolean' &&
    'createdAt' in resData.user &&
    typeof resData.user.createdAt === 'string' &&
    'updatedAt' in resData.user &&
    typeof resData.user.updatedAt === 'string' &&
    'bio' in resData.user &&
    (typeof resData.user.bio === 'string' || resData.user.bio === null)
  );
}
