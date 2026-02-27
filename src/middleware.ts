import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Pour décoder le JWT dans le middleware, il est recommandé d'utiliser 'jose'
// car 'jsonwebtoken' ne fonctionne pas dans l'Edge Runtime de Next.js.

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value; // On suppose que tu stockes le rôle dans un cookie
  const { pathname } = request.nextUrl;

  const authRequired = ['/dashboard', '/learn', '/my-courses'];
  const instructorRequired = ['/instructor', '/courses/create'];
  const adminRequired = ['/admin'];

  // 1. Redirection si non connecté
  if (!accessToken) {
    const isProtected = [...authRequired, ...instructorRequired, ...adminRequired].some(p => 
      pathname.startsWith(p)
    );
    
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Vérification du rôle Instructeur
  if (instructorRequired.some(p => pathname.startsWith(p)) && userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Vérification du rôle Admin
  if (adminRequired.some(p => pathname.startsWith(p)) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/instructor/:path*', '/learn/:path*', '/courses/:path*'],
};