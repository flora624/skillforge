// middleware.js

import { NextResponse } from 'next/server';

export function middleware(request) {
  // This function now only runs on your PROTECTED routes,
  // thanks to the new `matcher` config below.

  // ❗ IMPORTANT: Replace 'authjs.session-token' with the ACTUAL name of your login cookie.
  // How to find your cookie name:
  // 1. Log into your site.
  // 2. Open Developer Tools (F12).
  // 3. Go to the "Application" tab.
  // 4. Look under "Storage" -> "Cookies" -> your site URL.
  // 5. Find the cookie that appears when you log in. It might be 'auth.token', 'session', etc.
  //    Based on your use of Firebase Auth, it might be a cookie managed by your server
  //    or a client-side token. If you handle auth purely client-side, this middleware
  //    might need a different strategy, but a server-set cookie is standard.
  const hasAuthCookie = request.cookies.has('your-auth-cookie-name-here'); // <--- CHANGE THIS!

  // If the user is on a protected route and has no auth cookie, redirect them to the homepage.
  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the cookie exists, allow the request to proceed.
  return NextResponse.next();
}

// This `config` block is the key to efficiency and correctness.
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - / (the root homepage, so new users can see it)
   * - /login (the login page)
   * - /signup (the signup page)
   * - /portfolio (our public portfolio pages)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|portfolio|login|signup|^/$).*)',
  ],
};