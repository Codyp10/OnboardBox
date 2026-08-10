import Link from "next/link";
import { notFound } from "next/navigation";
import { createApprovalAction } from "@/lib/actions";
import { demoDb } from "@/lib/demo/store";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminApprovalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = demoDb.getCompany(id);
  if (!company) notFound();
  const approvals = demoDb.listApprovals(id);

  return (
    <div>
      <Link
        href={`/admin/companies/${id}`}
        className="text-sm font-semibold text-ob-teal-700"
      >
        ← Back to company
      </Link>
      <PageHeader
        title="Approvals"
        description="Generic approval items for creative, copy, pages, and more."
      />

      {!company.approvals_enabled ? (
        <EmptyState
          title="Approvals disabled"
          description="Enable approvals on the company page before sending items."
        />
      ) : (
        <>
          <Panel className="mb-6">
            <form action={createApprovalAction} className="space-y-3">
              <input type="hidden" name="companyId" value={id} />
              <label className="block text-sm">
                <span className="font-semibold">Title</span>
                <input
                  name="title"
                  required
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Description</span>
                <textarea
                  name="description"
                  rows={3}
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Item type</span>
                <input
                  name="item_type"
                  defaultValue="ad_creative"
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <Button type="submit">Send for approval</Button>
            </form>
          </Panel>
          <ul className="space-y-3">
            {approvals.map((approval) => (
              <li key={approval.id}>
                <Panel>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{approval.title}</h2>
                      <p className="text-sm text-ob-ink-muted">
                        {approval.description}
                      </p>
                    </div>
                    <StatusBadge
                      label={approval.status.replaceAll("_", " ")}
                      tone="neutral"
                    />
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
