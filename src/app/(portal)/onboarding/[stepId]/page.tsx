import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import {
  completeInstructionStepAction,
  markWebsiteAccessAddedAction,
  saveQuestionnaireAction,
  setWebsitePlatformAction,
  startConnectionAction,
  startDocuSignAction,
  startStripeAction,
  uploadFileAction,
} from "@/lib/actions";
import { WEBSITE_PLATFORMS, getWebsitePlatform } from "@/lib/onboarding/website-platforms";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuestionnaireForm } from "@/components/onboarding/questionnaire-form";

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ stepId: string }>;
}) {
  const { stepId } = await params;
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = demoDb.getCompanyForUser(session.profile.id);
  if (!company) redirect("/login");
  const data = demoDb.getOnboarding(company.id);
  const step = data?.steps.find((s) => s.id === stepId);
  if (!step) notFound();

  const questionnaire = demoDb.getQuestionnaireForStep(step.id);
  const platform = getWebsitePlatform(step.website_platform);
  const connections = demoDb.listConnections(company.id);

  return (
    <div>
      <Link
        href="/onboarding"
        className="text-sm font-semibold text-ob-teal-700 hover:text-ob-teal-900"
      >
        ← Back to onboarding
      </Link>
      <PageHeader title={step.title} description={step.description ?? undefined} />

      <Panel className="ob-fade-up space-y-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={step.status.replaceAll("_", " ")}
            tone={step.status === "completed" ? "success" : "warning"}
          />
          {step.blocks_launch ? (
            <StatusBadge label="Blocks launch" tone="danger" />
          ) : null}
          {step.required ? (
            <StatusBadge label="Required" tone="info" />
          ) : (
            <StatusBadge label="Optional" tone="neutral" />
          )}
        </div>

        {(step.step_type === "instruction" ||
          step.step_type === "custom" ||
          step.step_type === "external_link") && (
          <div className="space-y-4">
            <p className="text-ob-ink-muted">
              {step.description ??
                "Review this step, then mark it complete when you're ready."}
            </p>
            {step.external_url ? (
              <a
                href={step.external_url}
                className="text-sm font-semibold text-ob-teal-700"
                target="_blank"
                rel="noreferrer"
              >
                Open external link
              </a>
            ) : null}
            {step.status !== "completed" ? (
              <form action={completeInstructionStepAction}>
                <input type="hidden" name="stepId" value={step.id} />
                <input type="hidden" name="companyId" value={company.id} />
                <Button type="submit">Mark complete</Button>
              </form>
            ) : null}
          </div>
        )}

        {step.step_type === "questionnaire" && questionnaire ? (
          <QuestionnaireForm
            companyId={company.id}
            stepId={step.id}
            questionnaireId={questionnaire.questionnaire.id}
            questions={questionnaire.questions}
            responses={questionnaire.responses}
            action={saveQuestionnaireAction}
          />
        ) : null}

        {step.step_type === "file_upload" ? (
          <div className="space-y-4">
            <p className="text-sm text-ob-ink-muted">
              Upload logos, brand guides, photos, or other assets. V1 uses one
              simple upload area.
            </p>
            <form action={uploadFileAction} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="stepId" value={step.id} />
              <input
                name="filename"
                required
                placeholder="e.g. logo-primary.svg"
                className="flex-1 rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
              <Button type="submit">Add file</Button>
            </form>
            <ul className="space-y-2 text-sm">
              {demoDb.listFiles(company.id).map((file) => (
                <li key={file.id} className="text-ob-ink-muted">
                  {file.original_filename}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step.step_type === "website_access" ? (
          <div className="space-y-5">
            <p className="text-sm text-ob-ink-muted">
              Choose your website platform. OnboardBox never asks for website
              passwords — use collaborator invites whenever possible.
            </p>
            <form action={setWebsitePlatformAction} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="stepId" value={step.id} />
              {WEBSITE_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  name="platform"
                  value={p.id}
                  className={`rounded-[10px] border px-3 py-3 text-left text-sm font-semibold transition ${
                    step.website_platform === p.id
                      ? "border-ob-teal-700 bg-ob-teal-100 text-ob-teal-900"
                      : "border-ob-stone-300 bg-white hover:bg-ob-stone-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </form>
            {platform ? (
              <div className="rounded-[14px] bg-ob-stone-100/80 p-4">
                <h3 className="font-semibold">{platform.label} instructions</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ob-ink-muted">
                  {platform.instructions.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
                {step.status !== "completed" &&
                step.status !== "waiting_verification" ? (
                  <form action={markWebsiteAccessAddedAction} className="mt-4">
                    <input type="hidden" name="companyId" value={company.id} />
                    <input type="hidden" name="stepId" value={step.id} />
                    <Button type="submit">I&apos;ve added JMCG</Button>
                  </form>
                ) : null}
                {step.status === "waiting_verification" ? (
                  <p className="mt-4 text-sm font-medium text-ob-teal-700">
                    Waiting for JMCG verification.
                  </p>
                ) : null}
                {step.status === "correction_requested" ? (
                  <p className="mt-4 text-sm font-medium text-ob-danger">
                    Correction requested — please review access and try again.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {step.step_type === "connection" ? (
          <div className="space-y-4">
            <p className="text-sm text-ob-ink-muted">
              Connect accounts with official authorization. OnboardBox will never
              ask for your Google or Meta password.
            </p>
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex flex-col gap-3 rounded-[14px] border border-ob-stone-300 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold">{conn.provider.replaceAll("_", " ")}</div>
                  <div className="text-sm text-ob-ink-muted">
                    {conn.connection_status === "connected"
                      ? conn.external_account_name
                      : "Not connected"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={conn.connection_status.replaceAll("_", " ")}
                    tone={
                      conn.connection_status === "connected"
                        ? "success"
                        : conn.connection_status === "needs_attention"
                          ? "warning"
                          : "neutral"
                    }
                  />
                  {conn.connection_status !== "connected" ? (
                    <form action={startConnectionAction}>
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="provider" value={conn.provider} />
                      <Button type="submit" variant="secondary">
                        Connect
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {step.step_type === "agreement" ? (
          <div className="space-y-4">
            <p className="text-sm text-ob-ink-muted">
              Agreements are signed in DocuSign. OnboardBox only tracks status.
            </p>
            <form action={startDocuSignAction}>
              <input type="hidden" name="companyId" value={company.id} />
              <Button type="submit">Review &amp; sign</Button>
            </form>
          </div>
        ) : null}

        {step.step_type === "payment" ? (
          <div className="space-y-4">
            <p className="text-sm text-ob-ink-muted">
              Payments are processed by Stripe. Card details never touch
              OnboardBox.
            </p>
            <form action={startStripeAction}>
              <input type="hidden" name="companyId" value={company.id} />
              <Button type="submit">Pay invoice</Button>
            </form>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
