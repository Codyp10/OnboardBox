import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { getCompanyReporting } from "@/lib/services/reporting";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

function formatMetric(name: string, value: number) {
  if (
    name.includes("spend") ||
    name.includes("cost") ||
    name === "cost_per_lead"
  ) {
    return `$${value.toLocaleString()}`;
  }
  return value.toLocaleString();
}

export default async function ReportingPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = demoDb.getCompanyForUser(session.profile.id);
  if (!company) redirect("/login");
  const reporting = await getCompanyReporting(company.id);

  return (
    <div>
      <PageHeader
        title="Reporting"
        description="High-level marketing KPIs. Individual lead records are intentionally not shown."
        action={<StatusBadge label={`${reporting.source} data`} tone="info" />}
      />

      <p className="mb-6 text-sm text-ob-ink-muted">Period: {reporting.periodLabel}</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Ad spend", reporting.overall.spend],
          ["Leads", reporting.overall.leads],
          ["Cost per lead", reporting.overall.cost_per_lead],
          ["Clicks", reporting.overall.clicks ?? 0],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="ob-fade-up rounded-[14px] border border-ob-stone-300/70 bg-white/70 p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-ob-ink-muted">
              {label}
            </div>
            <div className="mt-2 font-display text-3xl">
              {typeof value === "number" && String(label).toLowerCase().includes("lead") && !String(label).includes("Cost")
                ? value.toLocaleString()
                : typeof value === "number" &&
                    (String(label).includes("spend") ||
                      String(label).includes("Cost"))
                  ? `$${value.toLocaleString()}`
                  : value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reporting.channels.map((channel) => (
          <Panel key={channel.channel} className="ob-fade-up-delay">
            <h2 className="font-display text-2xl">{channel.label}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {Object.entries(channel.metrics).map(([name, value]) => (
                <div key={name}>
                  <dt className="text-ob-ink-muted">
                    {name.replaceAll("_", " ")}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {formatMetric(name, value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>
    </div>
  );
}
