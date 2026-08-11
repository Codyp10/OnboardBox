import Link from "next/link";
import { listCompanies } from "@/lib/data/companies";
import { demoDb, isDemoMode } from "@/lib/demo/store";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminCompaniesPage() {
  const companies = await listCompanies();

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

      {companies.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-ob-stone-300 bg-white/50 px-6 py-10 text-center">
          <h2 className="font-display text-xl text-ob-ink">No clients yet</h2>
          <p className="mt-2 text-sm text-ob-ink-muted">
            Create your first client company to start onboarding.
          </p>
        </div>
      ) : (
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
                const data = isDemoMode()
                  ? demoDb.getOnboarding(company.id)
                  : null;
                const progress = data
                  ? calculateOnboardingProgress(data.steps)
                  : null;
                return (
                  <tr
                    key={company.id}
                    className="border-b border-ob-stone-300/50"
                  >
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
                      {progress
                        ? `${progress.completionPercentage}%`
                        : company.ready_to_launch
                          ? "Ready"
                          : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={
                          (progress?.readyToLaunch ?? company.ready_to_launch)
                            ? "Yes"
                            : "No"
                        }
                        tone={
                          (progress?.readyToLaunch ?? company.ready_to_launch)
                            ? "success"
                            : "warning"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-ob-ink-muted">
                      {progress?.blockingIncomplete.length ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
