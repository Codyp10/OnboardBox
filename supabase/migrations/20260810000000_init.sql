-- OnboardBox V1 schema + RLS
-- Company-scoped tenant isolation is mandatory for all client data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_type as enum ('admin', 'client');
create type public.company_status as enum ('invited', 'onboarding', 'active', 'paused', 'former');
create type public.membership_status as enum ('invited', 'active', 'disabled');
create type public.company_service_status as enum ('planned', 'active', 'paused', 'ended');
create type public.onboarding_status as enum ('not_started', 'in_progress', 'ready_to_launch', 'completed');
create type public.step_type as enum (
  'questionnaire',
  'connection',
  'file_upload',
  'agreement',
  'payment',
  'instruction',
  'external_link',
  'manual_verification',
  'approval',
  'custom',
  'website_access'
);
create type public.step_status as enum (
  'not_started',
  'in_progress',
  'completed',
  'waiting_verification',
  'correction_requested',
  'skipped'
);
create type public.request_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type public.connection_status as enum ('not_connected', 'connected', 'needs_attention', 'revoked');
create type public.approval_status as enum ('pending', 'approved', 'changes_requested', 'cancelled');
create type public.invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.billing_status as enum ('draft', 'open', 'paid', 'void', 'uncollectible');
create type public.agreement_status as enum ('created', 'sent', 'delivered', 'completed', 'declined', 'voided');
create type public.website_platform as enum (
  'wordpress',
  'webflow',
  'shopify',
  'squarespace',
  'wix',
  'godaddy',
  'other',
  'unknown'
);

-- ---------------------------------------------------------------------------
-- Profiles (app users linked to auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  phone text,
  user_type public.user_type not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  website text,
  status public.company_status not null default 'invited',
  ready_to_launch boolean not null default false,
  approvals_enabled boolean not null default false,
  primary_contact_email text,
  primary_contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  membership_status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'US',
  phone text,
  website text,
  service_area_notes text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  sort_order int not null default 0
);

create table public.company_services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  status public.company_service_status not null default 'active',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  unique (company_id, service_id)
);

create table public.onboarding_step_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_title text not null,
  default_description text,
  default_step_type public.step_type not null,
  default_required boolean not null default true,
  default_blocks_launch boolean not null default false,
  service_id uuid references public.services (id) on delete set null,
  instructional_video_url text,
  external_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.onboarding_instances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies (id) on delete cascade,
  status public.onboarding_status not null default 'not_started',
  completion_percentage int not null default 0 check (completion_percentage between 0 and 100),
  ready_to_launch boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references public.onboarding_instances (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  template_id uuid references public.onboarding_step_templates (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  title text not null,
  description text,
  step_type public.step_type not null,
  sort_order int not null default 0,
  required boolean not null default true,
  blocks_launch boolean not null default false,
  depends_on_step_id uuid references public.onboarding_steps (id) on delete set null,
  status public.step_status not null default 'not_started',
  instructional_video_url text,
  external_url text,
  website_platform public.website_platform,
  metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  completed_by_user_id uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  verified_by_admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  onboarding_step_id uuid not null unique references public.onboarding_steps (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  version int not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.questionnaire_questions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
  question_key text not null,
  prompt text not null,
  help_text text,
  question_type text not null default 'text',
  required boolean not null default false,
  sort_order int not null default 0,
  configuration_json jsonb not null default '{}'::jsonb,
  unique (questionnaire_id, question_key)
);

create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
  question_id uuid not null references public.questionnaire_questions (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  value text,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (questionnaire_id, question_id)
);

create table public.questionnaire_response_history (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.questionnaire_responses (id) on delete cascade,
  previous_value text,
  new_value text,
  changed_by_user_id uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);

create table public.client_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  title text not null,
  instructions text,
  required boolean not null default true,
  status public.request_status not null default 'open',
  created_by_admin_id uuid references public.profiles (id) on delete set null,
  completed_by_user_id uuid references public.profiles (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.file_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  onboarding_step_id uuid references public.onboarding_steps (id) on delete set null,
  request_id uuid references public.client_requests (id) on delete set null,
  uploaded_by_user_id uuid references public.profiles (id) on delete set null,
  storage_provider text not null default 'supabase',
  storage_key text not null,
  original_filename text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  token text not null unique,
  status public.invite_status not null default 'pending',
  invited_by_admin_id uuid references public.profiles (id) on delete set null,
  accepted_by_user_id uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  location_id uuid references public.locations (id) on delete set null,
  provider text not null,
  connection_status public.connection_status not null default 'not_connected',
  external_account_id text,
  external_account_name text,
  scopes text[] default '{}',
  token_reference text,
  token_expires_at timestamptz,
  last_successful_sync_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider, location_id)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  title text not null,
  description text,
  item_type text not null default 'generic',
  preview_url text,
  status public.approval_status not null default 'pending',
  created_by_admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approval_actions (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.approvals (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  comment text,
  created_at timestamptz not null default now()
);

create table public.billing_references (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_invoice_id text,
  invoice_type text not null default 'initial',
  amount_cents int,
  currency text not null default 'usd',
  status public.billing_status not null default 'open',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agreement_references (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  provider text not null default 'docusign',
  provider_envelope_id text,
  agreement_name text not null,
  status public.agreement_status not null default 'created',
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reporting_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  location_id uuid references public.locations (id) on delete set null,
  channel text not null,
  metric_name text not null,
  metric_value numeric not null,
  period_start date not null,
  period_end date not null,
  source text not null default 'mock',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seed catalog data
-- ---------------------------------------------------------------------------

insert into public.services (key, name, description, sort_order) values
  ('meta_ads', 'Meta Ads', 'Facebook and Instagram advertising', 10),
  ('google_ads', 'Google Ads', 'Search and performance advertising', 20),
  ('google_lsa', 'Google Local Services Ads', 'Local services lead ads', 30),
  ('seo', 'SEO', 'Search engine optimization', 40),
  ('geo', 'GEO', 'Generative engine optimization', 50),
  ('google_business_profile', 'Google Business Profile', 'GBP management and optimization', 60),
  ('website', 'Website', 'Website build or access for marketing work', 70),
  ('podcast_editing', 'Podcast Editing', 'Podcast production and editing', 80);

insert into public.onboarding_step_templates
  (name, default_title, default_description, default_step_type, default_required, default_blocks_launch, service_id, sort_order)
select * from (values
  ('welcome', 'Welcome', 'Learn how OnboardBox works and what to expect.', 'instruction'::public.step_type, true, false, null::uuid, 10),
  ('company_info', 'Company Information', 'Confirm company details JMCG will use across services.', 'questionnaire'::public.step_type, true, true, null::uuid, 20),
  ('agreement', 'Review & Sign Agreement', 'Review and sign your JMCG agreement in DocuSign.', 'agreement'::public.step_type, true, true, null::uuid, 30),
  ('payment', 'Initial Payment', 'Complete your initial invoice securely through Stripe.', 'payment'::public.step_type, true, true, null::uuid, 40),
  ('business_questionnaire', 'Business Questionnaire', 'Tell us about your services, offers, and goals.', 'questionnaire'::public.step_type, true, true, null::uuid, 50),
  ('upload_files', 'Upload Brand Assets', 'Upload logos, photos, and brand materials.', 'file_upload'::public.step_type, true, false, null::uuid, 60),
  ('website_access', 'Website Access', 'Grant JMCG access to your website platform.', 'website_access'::public.step_type, true, true, null::uuid, 70),
  ('connect_google', 'Connect Google Accounts', 'Authorize Google Ads, Analytics, Search Console, or GBP as needed.', 'connection'::public.step_type, true, true, null::uuid, 80),
  ('connect_meta', 'Connect Meta Ads', 'Authorize Meta advertising access for your business.', 'connection'::public.step_type, true, true, null::uuid, 90),
  ('final_review', 'Final Review', 'Review remaining items before launch.', 'instruction'::public.step_type, true, false, null::uuid, 100)
) as t(name, default_title, default_description, default_step_type, default_required, default_blocks_launch, service_id, sort_order);

update public.onboarding_step_templates t
set service_id = s.id
from public.services s
where t.name = 'website_access' and s.key = 'website';

update public.onboarding_step_templates t
set service_id = s.id
from public.services s
where t.name = 'connect_meta' and s.key = 'meta_ads';

update public.onboarding_step_templates t
set service_id = s.id
from public.services s
where t.name = 'connect_google' and s.key = 'google_ads';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.user_type = 'admin'
  );
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_memberships m
    where m.company_id = target_company_id
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, user_type)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'user_type')::public.user_type, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_touch before update on public.companies
  for each row execute function public.touch_updated_at();
create trigger locations_touch before update on public.locations
  for each row execute function public.touch_updated_at();
create trigger onboarding_instances_touch before update on public.onboarding_instances
  for each row execute function public.touch_updated_at();
create trigger onboarding_steps_touch before update on public.onboarding_steps
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger connections_touch before update on public.integration_connections
  for each row execute function public.touch_updated_at();
create trigger approvals_touch before update on public.approvals
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.locations enable row level security;
alter table public.services enable row level security;
alter table public.company_services enable row level security;
alter table public.onboarding_step_templates enable row level security;
alter table public.onboarding_instances enable row level security;
alter table public.onboarding_steps enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questionnaire_questions enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.questionnaire_response_history enable row level security;
alter table public.client_requests enable row level security;
alter table public.file_assets enable row level security;
alter table public.invites enable row level security;
alter table public.integration_connections enable row level security;
alter table public.approvals enable row level security;
alter table public.approval_actions enable row level security;
alter table public.billing_references enable row level security;
alter table public.agreement_references enable row level security;
alter table public.reporting_metrics enable row level security;

-- Profiles
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self_or_admin on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Companies
create policy companies_admin_all on public.companies
  for all using (public.is_admin()) with check (public.is_admin());
create policy companies_member_select on public.companies
  for select using (public.is_company_member(id));

-- Memberships
create policy memberships_admin_all on public.company_memberships
  for all using (public.is_admin()) with check (public.is_admin());
create policy memberships_member_select on public.company_memberships
  for select using (user_id = auth.uid() or public.is_company_member(company_id));

-- Locations
create policy locations_admin_all on public.locations
  for all using (public.is_admin()) with check (public.is_admin());
create policy locations_member_select on public.locations
  for select using (public.is_company_member(company_id));

-- Services catalog readable by authenticated users
create policy services_read on public.services
  for select to authenticated using (true);
create policy services_admin_write on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy company_services_admin_all on public.company_services
  for all using (public.is_admin()) with check (public.is_admin());
create policy company_services_member_select on public.company_services
  for select using (public.is_company_member(company_id));

-- Templates
create policy templates_read on public.onboarding_step_templates
  for select to authenticated using (true);
create policy templates_admin_write on public.onboarding_step_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- Generic company-scoped helper policies
create policy onboarding_admin_all on public.onboarding_instances
  for all using (public.is_admin()) with check (public.is_admin());
create policy onboarding_member_select on public.onboarding_instances
  for select using (public.is_company_member(company_id));
create policy onboarding_member_update on public.onboarding_instances
  for update using (public.is_company_member(company_id));

create policy steps_admin_all on public.onboarding_steps
  for all using (public.is_admin()) with check (public.is_admin());
create policy steps_member_select on public.onboarding_steps
  for select using (public.is_company_member(company_id));
create policy steps_member_update on public.onboarding_steps
  for update using (public.is_company_member(company_id));

create policy questionnaires_admin_all on public.questionnaires
  for all using (public.is_admin()) with check (public.is_admin());
create policy questionnaires_member_select on public.questionnaires
  for select using (public.is_company_member(company_id));

create policy questions_admin_all on public.questionnaire_questions
  for all using (public.is_admin()) with check (public.is_admin());
create policy questions_member_select on public.questionnaire_questions
  for select using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id and public.is_company_member(q.company_id)
    )
  );

create policy responses_admin_all on public.questionnaire_responses
  for all using (public.is_admin()) with check (public.is_admin());
create policy responses_member_select on public.questionnaire_responses
  for select using (public.is_company_member(company_id));
create policy responses_member_upsert on public.questionnaire_responses
  for insert with check (public.is_company_member(company_id));
create policy responses_member_update on public.questionnaire_responses
  for update using (public.is_company_member(company_id));

create policy response_history_admin_all on public.questionnaire_response_history
  for all using (public.is_admin()) with check (public.is_admin());
create policy response_history_member_select on public.questionnaire_response_history
  for select using (
    exists (
      select 1 from public.questionnaire_responses r
      where r.id = response_id and public.is_company_member(r.company_id)
    )
  );
create policy response_history_member_insert on public.questionnaire_response_history
  for insert with check (
    exists (
      select 1 from public.questionnaire_responses r
      where r.id = response_id and public.is_company_member(r.company_id)
    )
  );

create policy requests_admin_all on public.client_requests
  for all using (public.is_admin()) with check (public.is_admin());
create policy requests_member_select on public.client_requests
  for select using (public.is_company_member(company_id));
create policy requests_member_update on public.client_requests
  for update using (public.is_company_member(company_id));

create policy files_admin_all on public.file_assets
  for all using (public.is_admin()) with check (public.is_admin());
create policy files_member_select on public.file_assets
  for select using (public.is_company_member(company_id));
create policy files_member_insert on public.file_assets
  for insert with check (public.is_company_member(company_id));

create policy invites_admin_all on public.invites
  for all using (public.is_admin()) with check (public.is_admin());

create policy connections_admin_all on public.integration_connections
  for all using (public.is_admin()) with check (public.is_admin());
create policy connections_member_select on public.integration_connections
  for select using (public.is_company_member(company_id));
-- Clients may initiate connect/reconnect UI updates; tokens stay server-side.
create policy connections_member_update on public.integration_connections
  for update using (public.is_company_member(company_id));

create policy approvals_admin_all on public.approvals
  for all using (public.is_admin()) with check (public.is_admin());
create policy approvals_member_select on public.approvals
  for select using (public.is_company_member(company_id));
create policy approvals_member_update on public.approvals
  for update using (public.is_company_member(company_id));

create policy approval_actions_admin_all on public.approval_actions
  for all using (public.is_admin()) with check (public.is_admin());
create policy approval_actions_member_select on public.approval_actions
  for select using (
    exists (
      select 1 from public.approvals a
      where a.id = approval_id and public.is_company_member(a.company_id)
    )
  );
create policy approval_actions_member_insert on public.approval_actions
  for insert with check (
    exists (
      select 1 from public.approvals a
      where a.id = approval_id and public.is_company_member(a.company_id)
    )
  );

create policy billing_admin_all on public.billing_references
  for all using (public.is_admin()) with check (public.is_admin());
create policy billing_member_select on public.billing_references
  for select using (public.is_company_member(company_id));

create policy agreements_admin_all on public.agreement_references
  for all using (public.is_admin()) with check (public.is_admin());
create policy agreements_member_select on public.agreement_references
  for select using (public.is_company_member(company_id));

create policy reporting_admin_all on public.reporting_metrics
  for all using (public.is_admin()) with check (public.is_admin());
create policy reporting_member_select on public.reporting_metrics
  for select using (public.is_company_member(company_id));

-- Storage bucket (create via dashboard or CLI): company-files
-- Path convention: {company_id}/{asset_id}/{filename}
insert into storage.buckets (id, name, public)
values ('company-files', 'company-files', false)
on conflict (id) do nothing;

create policy company_files_member_read on storage.objects
  for select using (
    bucket_id = 'company-files'
    and (
      public.is_admin()
      or public.is_company_member((storage.foldername(name))[1]::uuid)
    )
  );

create policy company_files_member_insert on storage.objects
  for insert with check (
    bucket_id = 'company-files'
    and (
      public.is_admin()
      or public.is_company_member((storage.foldername(name))[1]::uuid)
    )
  );
