import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createInviteAction,
  toggleApprovalsAction,
  updateCompanyStatusAction,
} from "@/lib/actions";
import { demoDb } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = demoDb.getCompany(id);
  if (!company) notFound();

  const locations = demoDb.getLocations(id);
  const services = demoDb.getCompanyServices(id);
  const members = demoDb.getMemberships(id);
  const onboarding = demoDb.getOnboarding(id);
  const progress = onboarding
    ? calculateOnboardingProgress(onboarding.steps)
    : null;
  const pendingInvites = demoDb.listInvites(id);

  return (
    <div>
      <PageHeader
        title={company.name}
        description="Company overview, invite users, and jump into onboarding controls."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/companies/${id}/onboarding`}
              className="rounded-[10px] bg-ob-teal-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Onboarding
            </Link>
            <Link
              href={`/admin/companies/${id}/requests`}
              className="rounded-[10px] border border-ob-stone-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Requests
            </Link>
            <Link
              href={`/admin/companies/${id}/approvals`}
              className="rounded-[10px] border border-ob-stone-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Approvals
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="ob-fade-up">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={company.status} tone="neutral" />
            <StatusBadge
              label={
                progress?.readyToLaunch ? "Ready to Launch" : "Not ready"
              }
              tone={progress?.readyToLaunch ? "success" : "warning"}
            />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-ob-ink-muted">Legal name</dt>
              <dd className="font-medium">{company.legal_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ob-ink-muted">Website</dt>
              <dd className="font-medium">{company.website ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ob-ink-muted">Onboarding</dt>
              <dd className="font-medium">
                {progress ? `${progress.completionPercentage}%` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ob-ink-muted">Blocking remaining</dt>
              <dd className="font-medium">
                {progress?.blockingIncomplete.length ?? 0}
              </dd>
            </div>
          </dl>

          <form action={updateCompanyStatusAction} className="mt-5 flex gap-2">
            <input type="hidden" name="companyId" value={id} />
            <select
              name="status"
              defaultValue={company.status}
              className="rounded-[10px] border border-ob-stone-300 px-3 py-2 text-sm"
            >
              {["invited", "onboarding", "active", "paused", "former"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>
            <Button type="submit" variant="secondary">
              Update status
            </Button>
          </form>

          <form action={toggleApprovalsAction} className="mt-3">
            <input type="hidden" name="companyId" value={id} />
            <input
              type="hidden"
              name="enabled"
              value={company.approvals_enabled ? "false" : "true"}
            />
            <Button type="submit" variant="ghost">
              {company.approvals_enabled
                ? "Disable approvals"
                : "Enable approvals"}
            </Button>
          </form>
        </Panel>

        <Panel className="ob-fade-up-delay">
          <h2 className="font-display text-2xl">Invite client user</h2>
          <p className="mt-1 text-sm text-ob-ink-muted">
            Invitations are sent manually. Email is stubbed until a provider is
            configured.
          </p>
          <form action={createInviteAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="companyId" value={id} />
            <input
              name="email"
              type="email"
              required
              placeholder="client@example.com"
              className="flex-1 rounded-[10px] border border-ob-stone-300 px-3 py-2"
            />
            <Button type="submit">Send invite</Button>
          </form>
          <ul className="mt-4 space-y-2 text-sm">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="rounded-[10px] bg-ob-stone-100 px-3 py-2">
                <div className="font-medium">{invite.email}</div>
                <div className="text-ob-ink-muted">
                  Status: {invite.status} ·{" "}
                  <Link
                    className="text-ob-teal-700"
                    href={`/invite/${invite.token}`}
                  >
                    Open invite link
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ob-ink-muted">
            Stub email is logged in demo memory until a provider is configured.
          </p>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Locations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {locations.map((location) => (
              <li key={location.id}>
                <span className="font-semibold">{location.name}</span>
                <span className="text-ob-ink-muted">
                  {" "}
                  · {[location.city, location.state].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Services & users</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {services.map((cs) => (
              <span
                key={cs.id}
                className="rounded-[10px] bg-ob-teal-100 px-2.5 py-1 text-xs font-semibold text-ob-teal-900"
              >
                {cs.service.name}
              </span>
            ))}
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {members.map((member) => (
              <li key={member.id}>
                {member.profile.first_name} {member.profile.last_name} ·{" "}
                {member.profile.email}
              </li>
            ))}
            {members.length === 0 ? (
              <li className="text-ob-ink-muted">No users yet — send an invite.</li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
