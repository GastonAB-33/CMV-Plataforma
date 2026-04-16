import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { parseSessionToken } from '@/lib/auth/token';
import type { AuthSession } from '@/lib/auth/types';

export async function getRequestSession(request: NextRequest): Promise<AuthSession | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}
