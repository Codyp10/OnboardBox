import Link from "next/link";
import { demoLoginAction } from "@/lib/actions";
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
} from "@/lib/auth/actions";
import { isDemoMode } from "@/lib/demo/mode";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const demo = isDemoMode();
  const params = await searchParams;

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
              Demo mode is on. Use these shortcuts to explore the portal.
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
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl">Sign in</h1>
              <p className="mt-1 text-sm text-ob-ink-muted">
                Use the email account invited by JMCG.
              </p>
            </div>

            {params.error ? (
              <p className="rounded-[10px] bg-[#F3DADA] px-3 py-2 text-sm text-ob-danger">
                {params.error}
              </p>
            ) : null}
            {params.message === "check_email" ? (
              <p className="rounded-[10px] bg-ob-teal-100 px-3 py-2 text-sm text-ob-teal-900">
                Check your email to confirm your account, then sign in.
              </p>
            ) : null}

            <form action={signInWithPasswordAction} className="space-y-3">
              <label className="block text-sm">
                <span className="font-semibold">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <details className="rounded-[10px] border border-ob-stone-300/80 p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                Create an account
              </summary>
              <form action={signUpWithPasswordAction} className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-semibold">First name</span>
                    <input
                      name="first_name"
                      className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold">Last name</span>
                    <input
                      name="last_name"
                      className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="font-semibold">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Password</span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                  />
                </label>
                <Button type="submit" variant="secondary" className="w-full">
                  Sign up
                </Button>
              </form>
            </details>
          </div>
        )}
      </Panel>
    </main>
  );
}
