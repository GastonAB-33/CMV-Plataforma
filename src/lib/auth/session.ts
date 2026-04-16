import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, AUTH_SESSION_MAX_AGE_SECONDS } from '@/lib/auth/constants';
import { createSignedSessionToken, parseSessionToken } from '@/lib/auth/token';
import type { AuthSession } from '@/lib/auth/types';

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}

export async function createSession(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSignedSessionToken(session, AUTH_SESSION_MAX_AGE_SECONDS);

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
