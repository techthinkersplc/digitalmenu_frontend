import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get the token from cookies
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Map paths exactly to your folder structure
  const isLoginPage = pathname === '/admin'; 
  const isDashboardPage = pathname.startsWith('/admin/dashboard');

  // 3. If trying to access the dashboard without a token, redirect to the /admin login page
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 4. If already logged in and trying to view the login page, send straight to the dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// 5. Explicitly watch only your login and admin sub-routes
export const config = {
  matcher: ['/admin', '/admin/dashboard/:path*'],
};