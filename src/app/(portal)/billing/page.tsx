import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { getCompanyForUserId } from "@/lib/data/companies";
import { NoCompanyState } from "@/components/portal/no-company-state";
import { startDocuSignAction, startStripeAction } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function BillingPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = await getCompanyForUserId(session.profile.id);
  if (!company) {
    return (
      <NoCompanyState isAdmin={session.profile.user_type === "admin"} />
    );
  }
  const billing = demoDb.listBilling(company.id);
  const agreements = demoDb.listAgreements(company.id);

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices and agreements are handled by Stripe and DocuSign. OnboardBox shows status only."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="ob-fade-up">
          <h2 className="font-display text-2xl">Agreements</h2>
          <ul className="mt-4 space-y-4">
            {agreements.map((agreement) => (
              <li key={agreement.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{agreement.agreement_name}</div>
                    <div className="text-sm text-ob-ink-muted">
                      Provider: DocuSign
                    </div>
                  </div>
                  <StatusBadge
                    label={agreement.status}
                    tone={
                      agreement.status === "completed" ? "success" : "warning"
                    }
                  />
                </div>
                {agreement.status !== "completed" ? (
                  <form action={startDocuSignAction}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <Button type="submit" variant="secondary">
                      Review &amp; sign
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-ob-success">
                    Signed{" "}
                    {agreement.signed_at
                      ? new Date(agreement.signed_at).toLocaleString()
                      : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="ob-fade-up-delay">
          <h2 className="font-display text-2xl">Invoices</h2>
          <ul className="mt-4 space-y-4">
            {billing.map((invoice) => (
              <li key={invoice.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold capitalize">
                      {invoice.invoice_type} invoice
                    </div>
                    <div className="text-sm text-ob-ink-muted">
                      {invoice.amount_cents != null
                        ? `$${(invoice.amount_cents / 100).toLocaleString()}`
                        : "Amount set in Stripe"}{" "}
                      · Provider: Stripe
                    </div>
                  </div>
                  <StatusBadge
                    label={invoice.status}
                    tone={invoice.status === "paid" ? "success" : "warning"}
                  />
                </div>
                {invoice.status !== "paid" ? (
                  <form action={startStripeAction}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <Button type="submit">Pay invoice</Button>
                  </form>
                ) : (
                  <p className="text-sm text-ob-success">
                    Paid{" "}
                    {invoice.paid_at
                      ? new Date(invoice.paid_at).toLocaleString()
                      : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
