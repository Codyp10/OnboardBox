import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { approvalDecisionAction } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function ApprovalsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = demoDb.getCompanyForUser(session.profile.id);
  if (!company) redirect("/login");

  if (!company.approvals_enabled) {
    return (
      <div>
        <PageHeader
          title="Approvals"
          description="Approvals are optional and configured per client."
        />
        <EmptyState
          title="Approvals are not enabled"
          description="JMCG has not enabled the approvals workflow for your company. You do not need to take action here."
        />
      </div>
    );
  }

  const approvals = demoDb.listApprovals(company.id);

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Review items JMCG sends for approval. Approve or request changes."
      />
      {approvals.length === 0 ? (
        <EmptyState
          title="No approval items"
          description="When JMCG sends creative, copy, or other work for review, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const history = demoDb.listApprovalActions(approval.id);
            return (
              <Panel key={approval.id} className="ob-fade-up">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">{approval.title}</h2>
                    <p className="mt-1 text-sm text-ob-ink-muted">
                      {approval.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-ob-ink-muted">
                      {approval.item_type.replaceAll("_", " ")}
                    </p>
                  </div>
                  <StatusBadge
                    label={approval.status.replaceAll("_", " ")}
                    tone={
                      approval.status === "approved"
                        ? "success"
                        : approval.status === "changes_requested"
                          ? "warning"
                          : "info"
                    }
                  />
                </div>
                {approval.status === "pending" ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <form action={approvalDecisionAction} className="space-y-2">
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="approvalId" value={approval.id} />
                      <input type="hidden" name="action" value="approve" />
                      <Button type="submit" className="w-full">
                        Approve
                      </Button>
                    </form>
                    <form action={approvalDecisionAction} className="space-y-2">
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="approvalId" value={approval.id} />
                      <input type="hidden" name="action" value="request_changes" />
                      <input
                        name="comment"
                        placeholder="What should change?"
                        className="w-full rounded-[10px] border border-ob-stone-300 px-3 py-2 text-sm"
                      />
                      <Button type="submit" variant="secondary" className="w-full">
                        Request changes
                      </Button>
                    </form>
                  </div>
                ) : null}
                {history.length > 0 ? (
                  <ul className="mt-4 space-y-1 border-t border-ob-stone-300/70 pt-3 text-sm text-ob-ink-muted">
                    {history.map((item) => (
                      <li key={item.id}>
                        {item.action.replaceAll("_", " ")}
                        {item.comment ? ` — ${item.comment}` : ""} ·{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
