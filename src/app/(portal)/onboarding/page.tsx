import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

function stepTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "waiting_verification") return "info" as const;
  if (status === "correction_requested") return "danger" as const;
  if (status === "in_progress") return "warning" as const;
  return "neutral" as const;
}

function stepLabel(status: string) {
  switch (status) {
    case "completed":
      return "Complete";
    case "waiting_verification":
      return "Waiting for JMCG";
    case "correction_requested":
      return "Action Required";
    case "in_progress":
      return "In Progress";
    default:
      return "Not Started";
  }
}

export default async function OnboardingPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = demoDb.getCompanyForUser(session.profile.id);
  if (!company) redirect("/login");
  const data = demoDb.getOnboarding(company.id);
  if (!data) {
    return <PageHeader title="Onboarding" description="No onboarding yet." />;
  }
  const progress = calculateOnboardingProgress(data.steps);

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="Complete the items below at your pace. Progress saves automatically."
      />

      <Panel className="mb-6 ob-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-ob-ink-muted">Ready to Launch</div>
            <div className="font-display text-2xl">
              {progress.readyToLaunch ? "Yes" : "Not yet"}
            </div>
          </div>
          <StatusBadge
            label={`${progress.completionPercentage}% complete`}
            tone={progress.readyToLaunch ? "success" : "info"}
          />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ob-stone-100">
          <div
            className="ob-progress-fill h-full rounded-full bg-ob-teal-700"
            style={{ width: `${progress.completionPercentage}%` }}
          />
        </div>
        {progress.blockingIncomplete.length > 0 ? (
          <p className="mt-3 text-sm text-ob-ink-muted">
            {progress.blockingIncomplete.length} launch-blocking item
            {progress.blockingIncomplete.length === 1 ? "" : "s"} remaining.
          </p>
        ) : (
          <p className="mt-3 text-sm text-ob-success">
            All launch-blocking items are complete.
          </p>
        )}
      </Panel>

      <ol className="space-y-3">
        {data.steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={`/onboarding/${step.id}`}
              className="block rounded-[14px] border border-ob-stone-300/80 bg-white/70 p-4 transition hover:border-ob-teal-700/40 hover:bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-ob-ink-muted">
                    Step {index + 1}
                    {step.blocks_launch ? " · Blocks launch" : ""}
                    {step.required ? " · Required" : " · Optional"}
                  </div>
                  <div className="mt-1 font-display text-xl">{step.title}</div>
                  <p className="mt-1 text-sm text-ob-ink-muted">
                    {step.description}
                  </p>
                </div>
                <StatusBadge
                  label={stepLabel(step.status)}
                  tone={stepTone(step.status)}
                />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
