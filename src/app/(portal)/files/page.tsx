import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { demoDb } from "@/lib/demo/store";
import { getCompanyForUserId } from "@/lib/data/companies";
import { NoCompanyState } from "@/components/portal/no-company-state";
import { uploadFileAction } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function FilesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const company = await getCompanyForUserId(session.profile.id);
  if (!company) {
    return (
      <NoCompanyState isAdmin={session.profile.user_type === "admin"} />
    );
  }
  const files = demoDb.listFiles(company.id);

  return (
    <div>
      <PageHeader
        title="Files"
        description="One simple place to upload logos, photos, brand guides, and documents."
      />
      <Panel className="ob-fade-up">
        <form action={uploadFileAction} className="flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="companyId" value={company.id} />
          <input
            name="filename"
            required
            placeholder="Filename (demo upload)"
            className="flex-1 rounded-[10px] border border-ob-stone-300 px-3 py-2"
          />
          <Button type="submit">Upload</Button>
        </form>
        <p className="mt-3 text-xs text-ob-ink-muted">
          Demo mode records file metadata locally. With Supabase configured,
          files are stored privately in the company-files bucket.
        </p>
      </Panel>

      <div className="mt-6">
        {files.length === 0 ? (
          <EmptyState
            title="No files yet"
            description="Upload brand assets whenever you're ready. You can return later."
          />
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="rounded-[14px] border border-ob-stone-300/80 bg-white/70 px-4 py-3 text-sm"
              >
                <div className="font-semibold">{file.original_filename}</div>
                <div className="text-ob-ink-muted">
                  Added {new Date(file.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
