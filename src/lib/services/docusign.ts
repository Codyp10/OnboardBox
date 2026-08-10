/**
 * DocuSign orchestration boundary (built last).
 * Stub until DOCUSIGN_* credentials exist.
 * OnboardBox never implements its own e-signature engine.
 */

import { demoDb, isDemoMode } from "@/lib/demo/store";

export type SigningSession = {
  mode: "stub" | "live";
  envelopeId: string;
  signingUrl: string;
  status: string;
};

function configured() {
  return Boolean(
    process.env.DOCUSIGN_INTEGRATION_KEY &&
      process.env.DOCUSIGN_ACCOUNT_ID &&
      process.env.DOCUSIGN_USER_ID,
  );
}

export async function startAgreementSigning(companyId: string): Promise<SigningSession> {
  if (!configured()) {
    const envelopeId = `stub_env_${companyId.slice(0, 8)}`;
    return {
      mode: "stub",
      envelopeId,
      signingUrl: `/api/webhooks/docusign?stubComplete=1&companyId=${companyId}`,
      status: "sent",
    };
  }

  // Live DocuSign envelope creation would go here.
  return {
    mode: "live",
    envelopeId: "pending",
    signingUrl: "#",
    status: "created",
  };
}

export async function confirmAgreementSigned(companyId: string) {
  if (isDemoMode()) {
    return demoDb.markAgreementSigned(companyId);
  }
  // Live path would verify envelope status with DocuSign API / webhook signature.
  return null;
}
