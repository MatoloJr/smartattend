import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

const publicPaths = [
  '/', // Landing page
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth'
];

export async function middleware(req: NextRequestWithAuth) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for public paths and API auth routes
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req });
  const isAuthenticated = !!token;

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Check user role for admin routes
  if (path.startsWith('/admin') && token.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check user role for faculty routes
  if (path.startsWith('/faculty') && token.role !== 'faculty' && token.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

