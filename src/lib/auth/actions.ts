"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/mode";

export async function signInWithPasswordAction(formData: FormData) {
  if (isDemoMode()) {
    throw new Error("Use demo login while demo mode is enabled");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.user_type === "admin" ? "/admin/companies" : "/home");
}

export async function signUpWithPasswordAction(formData: FormData) {
  if (isDemoMode()) {
    throw new Error("Use demo login while demo mode is enabled");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: "client",
      },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=check_email");
}

export async function signOutAction() {
  if (isDemoMode()) {
    const { demoLogoutAction } = await import("@/lib/actions");
    return demoLogoutAction();
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
