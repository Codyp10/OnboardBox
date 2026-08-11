import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export function NoCompanyState({
  title = "No company assigned yet",
  isAdmin = false,
}: {
  title?: string;
  isAdmin?: boolean;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={
          isAdmin
            ? "You're signed in as an admin. Create a client company to start onboarding, or open Admin to manage clients."
            : "Your account is signed in. JMCG still needs to attach you to a client company, or an admin needs to create one."
        }
      />
      <EmptyState
        title="Nothing to show here yet"
        description={
          isAdmin
            ? "Admin accounts are not tied to a single client company. Use Admin → Clients to create and manage companies."
            : "Once your company membership is set up, Home, Onboarding, Reporting, and the rest of the portal will populate."
        }
      />
      {isAdmin ? (
        <div className="mt-6">
          <Link
            href="/admin/companies"
            className="inline-flex rounded-[10px] bg-ob-teal-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ob-teal-700"
          >
            Go to Admin → Clients
          </Link>
        </div>
      ) : null}
    </div>
  );
}
