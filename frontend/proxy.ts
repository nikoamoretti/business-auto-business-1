import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Skip Clerk entirely when keys are not configured (e.g. uptime-monitor MVP)
const clerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("REPLACE_ME") &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes("REPLACE_ME");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let proxy: any;

if (clerkConfigured) {
  // Dynamically load Clerk only when keys are present
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");
  const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/billing(.*)",
    "/settings(.*)",
  ]);
  proxy = clerkMiddleware(async (auth: { protect: () => Promise<void> }, req: NextRequest) => {
    if (isProtectedRoute(req)) await auth.protect();
  });
} else {
  proxy = (_req: NextRequest) => NextResponse.next();
}

// Next.js 16 uses "proxy" naming convention (equivalent to old "middleware")
export { proxy };
export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
