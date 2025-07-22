
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const idToken = request.cookies.get('firebaseIdToken')?.value;
  const { pathname } = request.nextUrl

  // A more robust solution would involve verifying the token with Firebase Admin SDK.
  // For this environment, we check for the presence of the token.
  const isAuthenticated = !!idToken;

  // if user is not logged in, redirect to login page for protected routes
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/forgot-password' && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // if user is logged in, redirect to dashboard from login/signup pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/forgot-password')) {
    return NextResponse.redirect(new URL('/', request.url))
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
