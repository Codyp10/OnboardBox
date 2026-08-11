import { acceptInviteAction } from "@/lib/actions";
import { demoDb } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = demoDb.getInviteByToken(token);
  const company = invite ? demoDb.getCompany(invite.company_id) : null;

  if (!invite || invite.status !== "pending") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <Panel>
          <h1 className="font-display text-2xl">Invitation unavailable</h1>
          <p className="mt-2 text-sm text-ob-ink-muted">
            This invite link is invalid, already used, or expired. Contact JMCG
            if you still need access.
          </p>
        </Panel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl text-ob-teal-900">OnboardBox</h1>
      <p className="mt-2 text-ob-ink-muted">
        Join {company?.name ?? "your company"} on OnboardBox.
      </p>
      <Panel className="mt-8">
        <form action={acceptInviteAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <label className="block text-sm">
            <span className="font-medium">First name</span>
            <input
              name="first_name"
              required
              className="mt-1 w-full rounded-[10px] border border-ob-stone-300 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Last name</span>
            <input
              name="last_name"
              required
              className="mt-1 w-full rounded-[10px] border border-ob-stone-300 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={invite.email}
              className="mt-1 w-full rounded-[10px] border border-ob-stone-300 bg-white px-3 py-2"
            />
          </label>
          <Button type="submit" className="w-full">
            Create account & join
          </Button>
        </form>
      </Panel>
    </main>
  );
}
