import { cookies } from "next/headers";
import { demoDb, isDemoMode } from "@/lib/demo/store";
import type { Profile, SessionUser } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

const DEMO_COOKIE = "ob_demo_user";

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    const jar = await cookies();
    const cookieUser = jar.get(DEMO_COOKIE)?.value;
    if (cookieUser) demoDb.setCurrentUser(cookieUser);
    const profile = demoDb.getCurrentUser();
    if (!profile) return null;
    const company = demoDb.getCompanyForUser(profile.id);
    return {
      profile,
      companyIds: company ? [company.id] : [],
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const { data: memberships } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("membership_status", "active");

  return {
    profile: profile as Profile,
    companyIds: (memberships ?? []).map((m) => m.company_id as string),
  };
}

export async function requireUser() {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.user_type !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireCompanyAccess(companyId: string) {
  const session = await requireUser();
  if (
    session.profile.user_type !== "admin" &&
    !session.companyIds.includes(companyId)
  ) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export { DEMO_COOKIE };
