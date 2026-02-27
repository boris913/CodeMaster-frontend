import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ On utilise userRole comme indicateur de session
  // (accessToken vit en mémoire JS, pas dans un cookie)
  const userRole = request.cookies.get('userRole')?.value;
  const isAuthenticated = !!userRole;

  const { pathname } = request.nextUrl;

  const authRequired = ['/dashboard', '/learn', '/my-courses'];
  const instructorRequired = ['/instructor', '/courses/create'];
  const adminRequired = ['/admin'];

  const isProtectedRoute = [...authRequired, ...instructorRequired, ...adminRequired]
    .some(p => pathname.startsWith(p));

  // 1. Non connecté → redirect login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // ✅ Mémoriser la destination
    return NextResponse.redirect(loginUrl);
  }

  // 2. Connecté mais mauvais rôle pour Instructor
  if (
    instructorRequired.some(p => pathname.startsWith(p)) &&
    userRole !== 'INSTRUCTOR' &&
    userRole !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Connecté mais mauvais rôle pour Admin
  if (
    adminRequired.some(p => pathname.startsWith(p)) &&
    userRole !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. ✅ Connecté sur une page auth (login/register) → redirect dashboard
  const authPages = ['/login', '/register', '/forgot-password'];
  if (isAuthenticated && authPages.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/instructor/:path*',
    '/learn/:path*',
    '/courses/create/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
