import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/types/database";

export async function createCompanyInSupabase(
  input: {
    name: string;
    legal_name?: string;
    website?: string;
    primary_contact_email?: string;
    primary_contact_phone?: string;
    serviceIds: string[];
    locations: Array<{ name: string; city?: string; state?: string }>;
    approvals_enabled?: boolean;
  },
  _adminId: string,
): Promise<Company> {
  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      legal_name: input.legal_name ?? null,
      website: input.website ?? null,
      primary_contact_email: input.primary_contact_email ?? null,
      primary_contact_phone: input.primary_contact_phone ?? null,
      approvals_enabled: input.approvals_enabled ?? false,
      status: "invited",
    })
    .select("*")
    .single();

  if (error || !company) {
    throw new Error(error?.message ?? "Failed to create company");
  }

  const locationRows = input.locations.map((loc, index) => ({
    company_id: company.id,
    name: loc.name,
    city: loc.city ?? null,
    state: loc.state ?? null,
    is_primary: index === 0,
  }));
  if (locationRows.length > 0) {
    const { error: locError } = await supabase.from("locations").insert(locationRows);
    if (locError) throw new Error(locError.message);
  }

  if (input.serviceIds.length > 0) {
    const { error: svcError } = await supabase.from("company_services").insert(
      input.serviceIds.map((service_id) => ({
        company_id: company.id,
        service_id,
        status: "active",
      })),
    );
    if (svcError) throw new Error(svcError.message);
  }

  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_instances")
    .insert({
      company_id: company.id,
      status: "not_started",
      completion_percentage: 0,
      ready_to_launch: false,
    })
    .select("*")
    .single();
  if (onboardingError || !onboarding) {
    throw new Error(onboardingError?.message ?? "Failed to create onboarding");
  }

  const { data: templates } = await supabase
    .from("onboarding_step_templates")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const selectedServiceIds = new Set(input.serviceIds);
  const steps = (templates ?? [])
    .filter((tpl) => !tpl.service_id || selectedServiceIds.has(tpl.service_id))
    .map((tpl) => ({
      onboarding_id: onboarding.id,
      company_id: company.id,
      template_id: tpl.id,
      service_id: tpl.service_id,
      title: tpl.default_title,
      description: tpl.default_description,
      step_type: tpl.default_step_type,
      sort_order: tpl.sort_order,
      required: tpl.default_required,
      blocks_launch: tpl.default_blocks_launch,
      instructional_video_url: tpl.instructional_video_url,
      external_url: tpl.external_url,
      status: "not_started",
      metadata: {},
    }));

  if (steps.length > 0) {
    const { error: stepsError } = await supabase
      .from("onboarding_steps")
      .insert(steps);
    if (stepsError) throw new Error(stepsError.message);
  }

  return company as Company;
}
