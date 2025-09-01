import { ServerAuthData, AuthResData, BaseAuthData, User } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import logger from './logger';

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error(
    'Expect the environment variable `BACKEND_URL` to be defined'
  );
}
export const backendUrl = BACKEND_URL;

const AUTH_URL = process.env.AUTH_URL;
if (!AUTH_URL) {
  throw new Error('Expect the environment variable `AUTH_URL` to be defined');
}
export const authUrl = AUTH_URL;

export const AUTH_COOKIE_KEY = 'authorization';
export const URL_HEADER_KEY = 'x-url';

export class AuthError extends Error {
  metadata = '';

  constructor(message: string, metadata = '') {
    super(message);
    this.name = 'AuthError';
    this.metadata = metadata;
  }
}

export async function getCurrentUrl() {
  const headerStore = await headers();
  const url = headerStore.get(URL_HEADER_KEY);
  if (!url) {
    throw new Error('Could not get the current URL');
  }
  return new URL(url);
}

export async function getAuthorization(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIE_KEY)?.value;
}

export const getAuthorizedUser = async (
  Authorization?: string
): Promise<User | null> => {
  try {
    if (Authorization) {
      const res = await fetch(`${backendUrl}/auth/me`, {
        headers: { Authorization },
      });
      if (res.ok) return await res.json();
    }
  } catch (error) {
    logger.error('Error fetching signed-in user:', error);
  }
  return null;
};

export const getBaseAuthData = async (): Promise<BaseAuthData> => {
  const token = await getAuthorization();
  const user = await getAuthorizedUser(token);
  return { backendUrl, authUrl, token, user };
};

export const getServerAuthData = async (): Promise<ServerAuthData> => {
  const initAuthData = await getBaseAuthData();
  const authFetch = async (pathname: string, init: RequestInit = {}) => {
    if (!pathname) throw new Error('Expect string `pathname` as 1st arg');
    const { headers, ...reqInit } = init;
    const res = await fetch(`${backendUrl}${pathname}`, {
      headers: { Authorization: initAuthData.token || '', ...headers },
      ...reqInit,
    });
    if (!res.ok) {
      throw new AuthError('API response is not okay', await res.text());
    }
    return res.json();
  };
  return { ...initAuthData, authFetch };
};

export function createAuthCookie(value: string, maxAge = 7 * 24 * 60 * 60) {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const cookieKey = encodeURIComponent(AUTH_COOKIE_KEY);
  const cookieValue = encodeURIComponent(value);
  return `${cookieKey}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}; Max-Age=${maxAge}`;
}

export const getResWithXHeaders = (req: NextRequest, res: NextResponse) => {
  res.headers.set(URL_HEADER_KEY, req.nextUrl.toString());
  return res;
};

export function signout() {
  return new NextResponse(null, {
    headers: { 'Set-Cookie': createAuthCookie('', 0) }, // Clear auth cookie
    status: 200,
  });
}

export function signin(authResData: AuthResData, req: NextRequest) {
  const res = new NextResponse(JSON.stringify(authResData), {
    headers: {
      'set-cookie': createAuthCookie(authResData.token),
      'Content-Type': 'application/json',
    },
    status: 200,
  });
  return getResWithXHeaders(req, res);
}

export function isAuthResData(data: unknown): data is AuthResData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof data.token === 'string' &&
    'user' in data &&
    typeof data.user === 'object' &&
    data.user !== null &&
    'id' in data.user &&
    typeof data.user.id === 'string' &&
    'username' in data.user &&
    typeof data.user.username === 'string' &&
    'fullname' in data.user &&
    typeof data.user.fullname === 'string' &&
    'isAdmin' in data.user &&
    typeof data.user.isAdmin === 'boolean' &&
    'createdAt' in data.user &&
    typeof data.user.createdAt === 'string' &&
    'updatedAt' in data.user &&
    typeof data.user.updatedAt === 'string' &&
    'bio' in data.user &&
    (typeof data.user.bio === 'string' || data.user.bio === null)
  );
}
