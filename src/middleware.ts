import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDemoMode } from "@/lib/demo/mode";

const PUBLIC_PATHS = ["/", "/login", "/invite", "/auth/callback", "/api/oauth", "/api/webhooks"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isDemoMode()) {
    const demoUser = request.cookies.get("ob_demo_user")?.value;
    if (!isPublic && !demoUser && !pathname.startsWith("/api/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
