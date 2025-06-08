import { signin, isAuthRes, AUTH_COOKIE_KEY, signout } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import logger from '@/lib/logger';

const apiBaseUrl = process.env.API_BASE_URL;

function handleRequestError(error: unknown) {
  logger.error(error?.toString() || 'Unknown error', error);
  return Response.json({ error: 'Something went wrong' }, { status: 500 });
}

function getEndpointFromPathname(pathname: string) {
  return pathname.replace(/^\/[^\/]*\//, '/');
}

async function handleRequest(req: NextRequest) {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  try {
    const search = req.nextUrl.search;
    const endpoint = getEndpointFromPathname(req.nextUrl.pathname);
    const Authorization = req.cookies.get(AUTH_COOKIE_KEY)?.value || '';
    const apiRes = await fetch(`${apiBaseUrl}${endpoint}${search}`, {
      headers: { 'Content-Type': 'application/json', Authorization },
      body: isMutation ? await req.text() : undefined,
      method: req.method,
      cache: 'no-store',
    });
    if (isMutation && apiRes.ok) {
      revalidatePath('/', 'layout');
    }
    return apiRes;
  } catch (error) {
    return handleRequestError(error);
  }
}

export async function HEAD(req: NextRequest) {
  return handleRequest(req);
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  try {
    const endpoint = getEndpointFromPathname(req.nextUrl.pathname);

    if (/\/signout$/.test(endpoint)) {
      revalidatePath('/', 'layout');
      return signout();
    }

    const apiRes = await handleRequest(req);

    const signinEndpoint = /\/(signin)$/.test(endpoint);
    const signupEndpoint = /\/(users)$/.test(endpoint) && req.method === 'POST';

    if (apiRes.ok && (signinEndpoint || signupEndpoint)) {
      const authRes = await apiRes.json();
      if (!isAuthRes(authRes)) {
        logger.error('Expect auth token on successful sign in/up', authRes);
        return Response.json({ error: 'Invalid operation' }, { status: 409 });
      }
      logger.info(`Signing ${signupEndpoint ? 'up' : 'in'}...`, authRes);
      return signin(authRes, req);
    }

    return apiRes;
  } catch (error) {
    return handleRequestError(error);
  }
}

export async function PUT(req: NextRequest) {
  return handleRequest(req);
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req);
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req);
}
