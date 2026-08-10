import Link from "next/link";
import { notFound } from "next/navigation";
import { createRequestAction } from "@/lib/actions";
import { demoDb } from "@/lib/demo/store";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = demoDb.getCompany(id);
  if (!company) notFound();
  const requests = demoDb.listRequests(id);

  return (
    <div>
      <Link
        href={`/admin/companies/${id}`}
        className="text-sm font-semibold text-ob-teal-700"
      >
        ← Back to company
      </Link>
      <PageHeader
        title="Client requests"
        description="Structured tasks — not chat. Clients complete them in the portal."
      />

      <Panel className="mb-6">
        <form action={createRequestAction} className="space-y-3">
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
            <span className="font-semibold">Instructions</span>
            <textarea
              name="instructions"
              rows={3}
              className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="required" defaultChecked />
            Required
          </label>
          <Button type="submit">Create request</Button>
        </form>
      </Panel>

      <ul className="space-y-3">
        {requests.map((request) => (
          <li key={request.id}>
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{request.title}</h2>
                  <p className="mt-1 text-sm text-ob-ink-muted">
                    {request.instructions}
                  </p>
                </div>
                <StatusBadge label={request.status} tone="neutral" />
              </div>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
