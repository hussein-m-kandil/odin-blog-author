import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { AuthRes, User } from '@/types';
import logger from './logger';

export const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const API_BASE_URL = process.env.API_BASE_URL;
export const AUTH_COOKIE_KEY = 'authorization';
export const PATHNAME_HEADER_KEY = 'x-pathname';
export const USER_ID_HEADER_KEY = 'x-uid';
export const URL_HEADER_KEY = 'x-url';

if (!API_BASE_URL || !PUBLIC_API_BASE_URL) {
  logger.error('Public or private API base URL is not defined', {
    ...process.env,
    API_BASE_URL: API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: PUBLIC_API_BASE_URL,
  });
}

export async function getSignedInUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const Authorization = cookieStore.get(AUTH_COOKIE_KEY)?.value;
    if (Authorization) {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
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

export const getResWithXHeaders = (
  req: NextRequest,
  res: NextResponse,
  user?: User | null
) => {
  res.headers.set(PATHNAME_HEADER_KEY, req.nextUrl.pathname);
  res.headers.set(URL_HEADER_KEY, req.nextUrl.toString());
  if (user) res.headers.set(USER_ID_HEADER_KEY, user.id);
  return res;
};

export function signout() {
  return new NextResponse(null, {
    headers: { 'Set-Cookie': createAuthCookie('', 0) }, // Clear auth cookie
    status: 200,
  });
}

export function signin(authRes: AuthRes, req: NextRequest) {
  const res = new NextResponse(JSON.stringify(authRes), {
    headers: {
      'set-cookie': createAuthCookie(authRes.token),
      'Content-Type': 'application/json',
    },
    status: 200,
  });
  return getResWithXHeaders(req, res);
}

export async function authedFetch(pathname: string, init?: RequestInit) {
  const headerStore = await headers();
  const reqInit = init || { headers: {} };
  const currentUrl = new URL(
    throwFalsyReturnTruthy(
      headerStore.get(URL_HEADER_KEY) || headerStore.get('referer')
    )
  );
  const apiRes = await fetch(
    new URL(
      `${PUBLIC_API_BASE_URL}${pathname}${currentUrl.search}`,
      currentUrl.origin
    ),
    {
      cache: 'no-store',
      ...reqInit,
      headers: {
        // Forward HTTP headers (including cookies) from incoming client request
        ...Object.fromEntries(headerStore.entries()),
        ...reqInit.headers,
      },
    }
  );
  return apiRes;
}

export async function getCurrentUrl() {
  const headerStore = await headers();
  return throwFalsyReturnTruthy(
    headerStore.get('referer') || headerStore.get(URL_HEADER_KEY)
  );
}

export async function getCurrentPathname() {
  return throwFalsyReturnTruthy((await headers()).get(PATHNAME_HEADER_KEY));
}

export async function getUserId() {
  return throwFalsyReturnTruthy((await headers()).get(USER_ID_HEADER_KEY));
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

function throwFalsyReturnTruthy<T>(value: T): NonNullable<T> | never {
  const evaluatedValue = typeof value === 'function' ? value() : value;
  if (evaluatedValue) return evaluatedValue;
  throw new AuthError();
}

class AuthError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    if (!args[0]) {
      args[0] = 'Something went wrong';
    }
    super(...args);
    this.name = 'AuthError';
  }
}
