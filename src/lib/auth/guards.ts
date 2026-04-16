import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import type { AuthSession } from '@/lib/auth/types';

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }
}
