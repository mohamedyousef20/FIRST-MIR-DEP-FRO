import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function adminMiddleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;
  const isAdmin = request.cookies.get('isAdmin')?.value === 'true';

  // If there's no token or user is not admin, redirect to login
  if (!token || !isAdmin) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
