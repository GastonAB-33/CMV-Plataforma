import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequestSession } from '@/lib/auth/request-session';

const protectedPaths = ['/dashboard', '/hermanos', '/seguimiento', '/eventos'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getRequestSession(request);

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedPath(pathname) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/hermanos/:path*',
    '/seguimiento/:path*',
    '/eventos/:path*',
  ],
};
