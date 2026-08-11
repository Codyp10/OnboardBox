import Link from "next/link";
import { demoDb } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminCompaniesPage() {
  const companies = demoDb.listCompanies();

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Create companies, manage onboarding, and monitor Ready to Launch."
        action={
          <Link
            href="/admin/companies/new"
            className="rounded-[10px] bg-ob-teal-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ob-teal-700"
          >
            Create client
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-[14px] border border-ob-stone-300/80 bg-white/70">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ob-stone-300/80 text-xs uppercase tracking-wide text-ob-ink-muted">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Onboarding</th>
              <th className="px-4 py-3">Ready to Launch</th>
              <th className="px-4 py-3">Blocking</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const data = demoDb.getOnboarding(company.id);
              const progress = data
                ? calculateOnboardingProgress(data.steps)
                : null;
              return (
                <tr key={company.id} className="border-b border-ob-stone-300/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className="font-semibold text-ob-teal-700 hover:text-ob-teal-900"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={company.status} tone="neutral" />
                  </td>
                  <td className="px-4 py-3">
                    {progress ? `${progress.completionPercentage}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={progress?.readyToLaunch ? "Yes" : "No"}
                      tone={progress?.readyToLaunch ? "success" : "warning"}
                    />
                  </td>
                  <td className="px-4 py-3 text-ob-ink-muted">
                    {progress?.blockingIncomplete.length ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
