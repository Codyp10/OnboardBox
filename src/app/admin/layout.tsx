import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { PortalNav } from "@/components/layout/portal-nav";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.profile.user_type !== "admin") redirect("/home");

  return (
    <div className="min-h-screen">
      <PortalNav
        mode="admin"
        userLabel={`${session.profile.first_name} ${session.profile.last_name}`}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
        <form action={signOutAction} className="mt-12">
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
