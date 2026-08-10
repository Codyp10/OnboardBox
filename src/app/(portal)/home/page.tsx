import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { getCompanyReporting } from "@/lib/services/reporting";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { completeRequestAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = demoDb.getCompanyForUser(session.profile.id);
  if (!company) redirect("/login");

  const onboardingData = demoDb.getOnboarding(company.id);
  const progress = onboardingData
    ? calculateOnboardingProgress(onboardingData.steps)
    : null;
  const requests = demoDb
    .listRequests(company.id)
    .filter((r) => r.status === "open" || r.status === "in_progress");
  const approvals = company.approvals_enabled
    ? demoDb.listApprovals(company.id).filter((a) => a.status === "pending")
    : [];
  const reporting = await getCompanyReporting(company.id);

  const nextAction =
    progress && progress.blockingIncomplete[0]
      ? progress.blockingIncomplete[0]
      : progress?.requiredIncomplete[0];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.profile.first_name}`}
        description={`${company.name} · your next actions and high-level marketing overview.`}
      />

      <div className="grid gap-6">
        <Panel className="ob-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">Current status</h2>
              <p className="mt-1 text-sm text-ob-ink-muted">
                {progress?.readyToLaunch
                  ? "Ready to Launch — JMCG has what it needs to start."
                  : nextAction
                    ? `Action required: ${nextAction.title}`
                    : "You're all caught up."}
              </p>
            </div>
            <StatusBadge
              label={
                progress?.readyToLaunch ? "Ready to Launch" : "Onboarding"
              }
              tone={progress?.readyToLaunch ? "success" : "warning"}
            />
          </div>
          {progress ? (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm text-ob-ink-muted">
                <span>Onboarding progress</span>
                <span>{progress.completionPercentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ob-stone-100">
                <div
                  className="ob-progress-fill h-full rounded-full bg-ob-teal-700"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              {nextAction ? (
                <Link
                  href={`/onboarding/${nextAction.id}`}
                  className="mt-4 inline-flex text-sm font-semibold text-ob-teal-700 hover:text-ob-teal-900"
                >
                  Continue: {nextAction.title} →
                </Link>
              ) : null}
            </div>
          ) : null}
        </Panel>

        <section className="ob-fade-up-delay grid gap-4 sm:grid-cols-4">
          {[
            ["Ad spend", reporting.overall.spend, "currency"],
            ["Leads", reporting.overall.leads, "number"],
            ["Cost per lead", reporting.overall.cost_per_lead, "currency"],
            ["Period", reporting.periodLabel, "text"],
          ].map(([label, value, kind]) => (
            <div key={String(label)} className="rounded-[14px] border border-ob-stone-300/70 bg-white/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ob-ink-muted">
                {label}
              </div>
              <div className="mt-2 font-display text-2xl text-ob-ink">
                {kind === "currency"
                  ? `$${Number(value).toLocaleString()}`
                  : String(value)}
              </div>
            </div>
          ))}
        </section>

        {requests.length > 0 ? (
          <Panel>
            <h2 className="font-display text-2xl">Outstanding requests</h2>
            <ul className="mt-4 space-y-3">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-col gap-3 border-t border-ob-stone-300/70 pt-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold">{request.title}</div>
                    <p className="text-sm text-ob-ink-muted">
                      {request.instructions}
                    </p>
                  </div>
                  <form action={completeRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="companyId" value={company.id} />
                    <Button type="submit" variant="secondary">
                      Mark complete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {company.approvals_enabled && approvals.length > 0 ? (
          <Panel>
            <h2 className="font-display text-2xl">Pending approvals</h2>
            <ul className="mt-4 space-y-2">
              {approvals.map((approval) => (
                <li key={approval.id}>
                  <Link
                    href="/approvals"
                    className="font-semibold text-ob-teal-700 hover:text-ob-teal-900"
                  >
                    {approval.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
