import { signin, signout, isAuthResData, backendUrl } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import logger from '@/lib/logger';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  try {
    revalidatePath('/', 'layout');

    const { action } = await context.params;

    if (action === 'signout') {
      return signout();
    }

    const url = new URL(backendUrl);
    const options: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
      method: 'POST',
    };

    switch (action) {
      case 'signin':
        url.pathname += '/auth/signin';
        break;
      case 'guest':
        url.pathname += '/users/guest';
        break;
      case 'signup':
        url.pathname += '/users';
        break;
      default:
        return Response.json({ status: 404 });
    }

    const res = await fetch(url, options);

    if (res.ok) {
      const data = await res.json();
      if (!isAuthResData(data)) {
        logger.error(`Unexpect ${action} response`, data);
        return Response.json(null, { status: 500 });
      }
      return signin(data, request);
    }

    return res;
  } catch (error) {
    logger.error(error?.toString() || 'Unknown error', error);
    return Response.json(null, { status: 500 });
  }
}
