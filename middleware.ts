import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/fines(.*)', '/players(.*)', '/teams(.*)', '/fixtures(.*)',
  '/dashboard(.*)', '/subscriptions(.*)', '/reports(.*)', '/settings(.*)',
  '/practice(.*)', '/player(.*)', '/games(.*)', '/onboarding(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

// Routes that are exempt from the team-setup check (public or display-only)
const isExempt = createRouteMatcher([
  '/onboarding(.*)',
  '/games/(.*)/display',
]);

export default clerkMiddleware(async (auth, req) => {
  // Enforce Clerk authentication on protected routes
  if (isProtectedRoute(req)) await auth.protect();

  const { userId } = await auth();

  // Enforce team setup: authenticated users without active-team-id cookie
  // must complete onboarding before accessing any protected route
  if (userId && isProtectedRoute(req) && !isExempt(req)) {
    const hasActiveTeam = req.cookies.has('active-team-id');
    if (!hasActiveTeam) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-pathname', req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
