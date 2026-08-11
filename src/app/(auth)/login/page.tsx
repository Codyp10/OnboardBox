import { demoLoginAction } from "@/lib/actions";
import { isDemoMode } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <Link href="/" className="font-display text-3xl text-ob-teal-900">
        OnboardBox
      </Link>
      <p className="mt-2 text-ob-ink-muted">
        Sign in to continue your JMCG client portal.
      </p>

      <Panel className="mt-8 ob-fade-up">
        {demo ? (
          <div className="space-y-4">
            <h1 className="font-display text-2xl">Demo sign in</h1>
            <p className="text-sm text-ob-ink-muted">
              Supabase credentials are not configured, so OnboardBox is running
              with a local demo data store.
            </p>
            <form action={demoLoginAction} className="space-y-3">
              <input type="hidden" name="role" value="client" />
              <Button type="submit" className="w-full">
                Continue as demo client
              </Button>
            </form>
            <form action={demoLoginAction}>
              <input type="hidden" name="role" value="admin" />
              <Button type="submit" variant="secondary" className="w-full">
                Continue as JMCG admin
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="font-display text-2xl">Sign in</h1>
            <p className="text-sm text-ob-ink-muted">
              Configure Supabase Auth environment variables to enable production
              login. Until then, set <code>NEXT_PUBLIC_DEMO_MODE=true</code>.
            </p>
          </div>
        )}
      </Panel>
    </main>
  );
}
