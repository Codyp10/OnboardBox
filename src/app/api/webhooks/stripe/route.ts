import { NextRequest, NextResponse } from "next/server";
import { confirmInvoicePaid } from "@/lib/services/stripe";

/**
 * Stripe webhook / stub completion endpoint.
 * Live webhooks must verify Stripe signatures. Never trust browser return alone.
 */
export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  const stubComplete = request.nextUrl.searchParams.get("stubComplete") === "1";

  if (stubComplete && companyId) {
    await confirmInvoicePaid(companyId);
    return NextResponse.redirect(new URL("/billing?invoice=paid", request.url));
  }

  return NextResponse.json({ ok: true, provider: "stripe", mode: "stub" });
}

export async function POST() {
  // Live: constructEvent with STRIPE_WEBHOOK_SECRET, then update billing_references.
  return NextResponse.json({ ok: true, received: true });
}
