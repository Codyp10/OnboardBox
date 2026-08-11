import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addCustomStepAction,
  reorderStepAction,
  updateStepFlagsAction,
  verifyWebsiteAccessAction,
} from "@/lib/actions";
import { demoDb } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminOnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = demoDb.getCompany(id);
  if (!company) notFound();
  const data = demoDb.getOnboarding(id);
  if (!data) notFound();
  const progress = calculateOnboardingProgress(data.steps);

  return (
    <div>
      <Link
        href={`/admin/companies/${id}`}
        className="text-sm font-semibold text-ob-teal-700"
      >
        ← Back to company
      </Link>
      <PageHeader
        title={`${company.name} onboarding`}
        description="Edit steps, required/blocking flags, order, and manual verification."
      />

      <Panel className="mb-6">
        <div className="flex flex-wrap gap-3">
          <StatusBadge
            label={`${progress.completionPercentage}% complete`}
            tone="info"
          />
          <StatusBadge
            label={progress.readyToLaunch ? "Ready to Launch" : "Not ready"}
            tone={progress.readyToLaunch ? "success" : "warning"}
          />
        </div>
      </Panel>

      <div className="space-y-4">
        {data.steps.map((step, index) => (
          <Panel key={step.id}>
            <form action={updateStepFlagsAction} className="space-y-3">
              <input type="hidden" name="companyId" value={id} />
              <input type="hidden" name="stepId" value={step.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-ob-ink-muted">
                    #{index + 1} · {step.step_type}
                  </div>
                  <input
                    name="title"
                    defaultValue={step.title}
                    className="mt-1 w-full max-w-md rounded-[10px] border border-ob-stone-300 px-3 py-2 font-display text-xl"
                  />
                </div>
                <StatusBadge
                  label={step.status.replaceAll("_", " ")}
                  tone={step.status === "completed" ? "success" : "neutral"}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="required"
                    defaultChecked={step.required}
                  />
                  Required
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="blocks_launch"
                    defaultChecked={step.blocks_launch}
                  />
                  Blocks launch
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary">
                  Save step
                </Button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={reorderStepAction}>
                <input type="hidden" name="companyId" value={id} />
                <input type="hidden" name="stepId" value={step.id} />
                <input type="hidden" name="direction" value="up" />
                <Button type="submit" variant="ghost">
                  Move up
                </Button>
              </form>
              <form action={reorderStepAction}>
                <input type="hidden" name="companyId" value={id} />
                <input type="hidden" name="stepId" value={step.id} />
                <input type="hidden" name="direction" value="down" />
                <Button type="submit" variant="ghost">
                  Move down
                </Button>
              </form>
            </div>

            {(step.step_type === "website_access" ||
              step.step_type === "manual_verification") &&
            step.status === "waiting_verification" ? (
              <div className="mt-4 flex gap-2 border-t border-ob-stone-300/70 pt-4">
                <form action={verifyWebsiteAccessAction}>
                  <input type="hidden" name="companyId" value={id} />
                  <input type="hidden" name="stepId" value={step.id} />
                  <input type="hidden" name="approve" value="true" />
                  <Button type="submit">Verify access</Button>
                </form>
                <form action={verifyWebsiteAccessAction}>
                  <input type="hidden" name="companyId" value={id} />
                  <input type="hidden" name="stepId" value={step.id} />
                  <input type="hidden" name="approve" value="false" />
                  <Button type="submit" variant="secondary">
                    Request correction
                  </Button>
                </form>
              </div>
            ) : null}
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <h2 className="font-display text-xl">Add custom step</h2>
        <form action={addCustomStepAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="companyId" value={id} />
          <input
            name="title"
            required
            placeholder="Custom step title"
            className="flex-1 rounded-[10px] border border-ob-stone-300 px-3 py-2"
          />
          <Button type="submit">Add step</Button>
        </form>
      </Panel>
    </div>
  );
}
