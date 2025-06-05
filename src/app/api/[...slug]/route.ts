import { signin, isAuthRes, AUTH_COOKIE_KEY, signout } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import logger from '@/lib/logger';

type RouteContext = { params: Promise<{ slug: string[] }> };

const apiBaseUrl = process.env.API_BASE_URL;

function handleRequestError(error: unknown) {
  logger.error(error?.toString() || 'Unknown error', error);
  return Response.json({ error: 'Something went wrong' }, { status: 500 });
}

async function handleRequest(req: NextRequest, { params }: RouteContext) {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  try {
    const endpoint = `/${(await params).slug.join('/')}`;
    const Authorization = req.cookies.get(AUTH_COOKIE_KEY)?.value || '';
    const apiRes = await fetch(`${apiBaseUrl}${endpoint}`, {
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

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const endpoint = `/${(await params).slug.join('/')}`;

    if (/\/signout$/.test(endpoint)) {
      revalidatePath('/', 'layout');
      return signout();
    }

    const apiRes = await handleRequest(req, { params });

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

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}
