import { NextRequest, NextResponse } from "next/server";
import { confirmAgreementSigned } from "@/lib/services/docusign";

/**
 * DocuSign webhook / stub completion endpoint.
 * Live webhooks must validate authenticity before updating status.
 */
export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  const stubComplete = request.nextUrl.searchParams.get("stubComplete") === "1";

  if (stubComplete && companyId) {
    await confirmAgreementSigned(companyId);
    return NextResponse.redirect(new URL("/billing?agreement=signed", request.url));
  }

  return NextResponse.json({ ok: true, provider: "docusign", mode: "stub" });
}

export async function POST() {
  // Live: verify DocuSign webhook signature, then update agreement_references.
  return NextResponse.json({ ok: true, received: true });
}
