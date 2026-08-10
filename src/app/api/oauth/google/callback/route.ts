import { NextRequest, NextResponse } from "next/server";
import { demoDb, isDemoMode } from "@/lib/demo/store";
import { parseOAuthState } from "@/lib/services/oauth";

export async function GET(request: NextRequest) {
  const stateParam = request.nextUrl.searchParams.get("state");
  const stub = request.nextUrl.searchParams.get("stub") === "1";
  const parsed = stateParam ? parseOAuthState(stateParam) : null;

  if (!parsed) {
    return NextResponse.redirect(new URL("/onboarding?error=oauth_state", request.url));
  }

  if (stub || isDemoMode()) {
    demoDb.stubConnect(parsed.provider, parsed.companyId);
    return NextResponse.redirect(new URL("/onboarding?connected=google", request.url));
  }

  // Live Google token exchange would validate code + store token_reference server-side.
  return NextResponse.redirect(
    new URL("/onboarding?error=oauth_not_configured", request.url),
  );
}
