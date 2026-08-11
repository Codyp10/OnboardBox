import { demoDb, isDemoMode } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type { Company, Location, Service } from "@/lib/types/database";

export async function getCompanyForUserId(userId: string): Promise<Company | null> {
  if (isDemoMode()) {
    return demoDb.getCompanyForUser(userId);
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userId)
    .eq("membership_status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership?.company_id) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", membership.company_id)
    .maybeSingle();

  return (company as Company | null) ?? null;
}

export async function listCompanies(): Promise<Company[]> {
  if (isDemoMode()) {
    return demoDb.listCompanies();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[companies] list failed", error.message);
    return [];
  }
  return (data as Company[]) ?? [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  if (isDemoMode()) {
    return demoDb.getCompany(id);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Company | null) ?? null;
}

export async function listServices(): Promise<Service[]> {
  if (isDemoMode()) {
    return demoDb.getServices();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return (data as Service[]) ?? [];
}

export async function listLocations(companyId: string): Promise<Location[]> {
  if (isDemoMode()) {
    return demoDb.getLocations(companyId);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });
  return (data as Location[]) ?? [];
}
