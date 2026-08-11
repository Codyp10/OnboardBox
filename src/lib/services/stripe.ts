/**
 * Stripe orchestration boundary (built last).
 * Stub until STRIPE_* credentials exist.
 * Never store raw card data — Stripe remains payment source of truth.
 */

import { demoDb, isDemoMode } from "@/lib/demo/store";

export type PaymentSession = {
  mode: "stub" | "live";
  invoiceId: string;
  checkoutUrl: string;
  status: string;
};

function configured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function startInvoicePayment(companyId: string): Promise<PaymentSession> {
  if (!configured()) {
    return {
      mode: "stub",
      invoiceId: `stub_in_${companyId.slice(0, 8)}`,
      checkoutUrl: `/api/webhooks/stripe?stubComplete=1&companyId=${companyId}`,
      status: "open",
    };
  }

  return {
    mode: "live",
    invoiceId: "pending",
    checkoutUrl: "#",
    status: "open",
  };
}

export async function confirmInvoicePaid(companyId: string) {
  if (isDemoMode()) {
    return demoDb.markInvoicePaid(companyId);
  }
  // Live path must verify invoice/payment status server-side (not browser return alone).
  return null;
}
