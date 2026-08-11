import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { getCompanyForUserId } from "@/lib/data/companies";
import { NoCompanyState } from "@/components/portal/no-company-state";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = await getCompanyForUserId(session.profile.id);
  if (!company) {
    return (
      <NoCompanyState isAdmin={session.profile.user_type === "admin"} />
    );
  }
  const locations = demoDb.getLocations(company.id);
  const services = demoDb.getCompanyServices(company.id);
  const members = demoDb.getMemberships(company.id);

  return (
    <div>
      <PageHeader
        title="Account"
        description="Company profile, locations, services, and users for your organization."
      />

      <div className="grid gap-6">
        <Panel className="ob-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">{company.name}</h2>
              <p className="mt-1 text-sm text-ob-ink-muted">
                {company.legal_name ?? "Legal name not set"}
              </p>
            </div>
            <StatusBadge label={company.status} tone="info" />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ob-ink-muted">Website</dt>
              <dd className="font-medium">{company.website ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ob-ink-muted">Primary contact</dt>
              <dd className="font-medium">
                {company.primary_contact_email ?? "—"}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Locations</h2>
          <ul className="mt-4 space-y-3">
            {locations.map((location) => (
              <li key={location.id} className="text-sm">
                <div className="font-semibold">
                  {location.name}
                  {location.is_primary ? " (Primary)" : ""}
                </div>
                <div className="text-ob-ink-muted">
                  {[location.city, location.state].filter(Boolean).join(", ") ||
                    "Address TBD"}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Services</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {services.map((cs) => (
              <li
                key={cs.id}
                className="rounded-[10px] bg-ob-teal-100 px-3 py-1.5 text-sm font-semibold text-ob-teal-900"
              >
                {cs.service.name}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">Users</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {members.map((member) => (
              <li key={member.id}>
                <span className="font-semibold">
                  {member.profile.first_name} {member.profile.last_name}
                </span>{" "}
                <span className="text-ob-ink-muted">
                  · {member.profile.email}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ob-ink-muted">
            In V1, all authorized users at a company see the same portal data.
          </p>
        </Panel>
      </div>
    </div>
  );
}
