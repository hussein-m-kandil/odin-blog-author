import logger from '@/lib/logger';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthRes, signoutAndRedirect, signinAndRedirect } from '@/lib/auth';

if (!process.env.API_BASE_URL || !process.env.NEXT_PUBLIC_API_BASE_URL) {
  const error = 'Public/Private API base URL is not defined';
  logger.error(error, {
    ...process.env,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });
}

type RouteContext = { params: Promise<{ slug: string[] }> };

const apiBaseUrl = process.env.API_BASE_URL;

function handleRequestError(error: unknown) {
  logger.error(error?.toString() || 'Unknown error', error);
  return Response.json({ error: 'Something went wrong' }, { status: 500 });
}

async function handleRequest(req: NextRequest, { params }: RouteContext) {
  try {
    const endpoint = `/${(await params).slug.join('/')}`;
    const Authorization = req.cookies.get('authorization')?.value || '';
    return await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', Authorization },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
      method: req.method,
      cache: 'no-store',
    });
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
      revalidatePath('/');
      return signoutAndRedirect(req);
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
      revalidatePath('/');
      return signinAndRedirect(authRes, req);
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
