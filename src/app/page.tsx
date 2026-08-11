import Link from "next/link";
import { isDemoMode } from "@/lib/demo/store";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getSessionUser();
  if (session) {
    redirect(
      session.profile.user_type === "admin" ? "/admin/companies" : "/home",
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="ob-fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ob-teal-700">
          JMCG
        </p>
        <h1 className="mt-3 font-display text-5xl leading-tight tracking-tight text-ob-teal-900 sm:text-6xl">
          OnboardBox
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ob-ink-muted">
          One calm place for clients to complete onboarding, connect accounts,
          share files, and review high-level marketing reporting.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-[10px] bg-ob-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ob-teal-700"
          >
            Sign in
          </Link>
          {isDemoMode() ? (
            <span className="self-center text-sm text-ob-ink-muted">
              Demo mode is on — no Supabase keys required.
            </span>
          ) : null}
        </div>
      </div>
    </main>
  );
}
