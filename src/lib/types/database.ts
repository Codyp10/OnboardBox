export type UserType = "admin" | "client";
export type CompanyStatus =
  | "invited"
  | "onboarding"
  | "active"
  | "paused"
  | "former";
export type MembershipStatus = "invited" | "active" | "disabled";
export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "ready_to_launch"
  | "completed";
export type StepType =
  | "questionnaire"
  | "connection"
  | "file_upload"
  | "agreement"
  | "payment"
  | "instruction"
  | "external_link"
  | "manual_verification"
  | "approval"
  | "custom"
  | "website_access";
export type StepStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "waiting_verification"
  | "correction_requested"
  | "skipped";
export type RequestStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ConnectionStatus =
  | "not_connected"
  | "connected"
  | "needs_attention"
  | "revoked";
export type ApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "cancelled";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";
export type BillingStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";
export type AgreementStatus =
  | "created"
  | "sent"
  | "delivered"
  | "completed"
  | "declined"
  | "voided";
export type WebsitePlatform =
  | "wordpress"
  | "webflow"
  | "shopify"
  | "squarespace"
  | "wix"
  | "godaddy"
  | "other"
  | "unknown";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  legal_name: string | null;
  website: string | null;
  status: CompanyStatus;
  ready_to_launch: boolean;
  approvals_enabled: boolean;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyMembership {
  id: string;
  company_id: string;
  user_id: string;
  membership_status: MembershipStatus;
  created_at: string;
}

export interface Location {
  id: string;
  company_id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  service_area_notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  key: string;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
}

export interface CompanyService {
  id: string;
  company_id: string;
  service_id: string;
  status: "planned" | "active" | "paused" | "ended";
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface OnboardingStepTemplate {
  id: string;
  name: string;
  default_title: string;
  default_description: string | null;
  default_step_type: StepType;
  default_required: boolean;
  default_blocks_launch: boolean;
  service_id: string | null;
  instructional_video_url: string | null;
  external_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface OnboardingInstance {
  id: string;
  company_id: string;
  status: OnboardingStatus;
  completion_percentage: number;
  ready_to_launch: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  onboarding_id: string;
  company_id: string;
  template_id: string | null;
  service_id: string | null;
  title: string;
  description: string | null;
  step_type: StepType;
  sort_order: number;
  required: boolean;
  blocks_launch: boolean;
  depends_on_step_id: string | null;
  status: StepStatus;
  instructional_video_url: string | null;
  external_url: string | null;
  website_platform: WebsitePlatform | null;
  metadata: Record<string, unknown>;
  completed_at: string | null;
  completed_by_user_id: string | null;
  verified_at: string | null;
  verified_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Questionnaire {
  id: string;
  onboarding_step_id: string;
  company_id: string;
  name: string;
  version: number;
  status: string;
  created_at: string;
}

export interface QuestionnaireQuestion {
  id: string;
  questionnaire_id: string;
  question_key: string;
  prompt: string;
  help_text: string | null;
  question_type: string;
  required: boolean;
  sort_order: number;
  configuration_json: Record<string, unknown>;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  question_id: string;
  company_id: string;
  user_id: string | null;
  value: string | null;
  submitted_at: string | null;
  updated_at: string;
}

export interface QuestionnaireResponseHistory {
  id: string;
  response_id: string;
  previous_value: string | null;
  new_value: string | null;
  changed_by_user_id: string | null;
  changed_at: string;
}

export interface ClientRequest {
  id: string;
  company_id: string;
  service_id: string | null;
  title: string;
  instructions: string | null;
  required: boolean;
  status: RequestStatus;
  created_by_admin_id: string | null;
  completed_by_user_id: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface FileAsset {
  id: string;
  company_id: string;
  onboarding_step_id: string | null;
  request_id: string | null;
  uploaded_by_user_id: string | null;
  storage_provider: string;
  storage_key: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Invite {
  id: string;
  company_id: string;
  email: string;
  token: string;
  status: InviteStatus;
  invited_by_admin_id: string | null;
  accepted_by_user_id: string | null;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export interface IntegrationConnection {
  id: string;
  company_id: string;
  location_id: string | null;
  provider: string;
  connection_status: ConnectionStatus;
  external_account_id: string | null;
  external_account_name: string | null;
  scopes: string[];
  token_reference: string | null;
  token_expires_at: string | null;
  last_successful_sync_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  company_id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  item_type: string;
  preview_url: string | null;
  status: ApprovalStatus;
  created_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalAction {
  id: string;
  approval_id: string;
  user_id: string | null;
  action: string;
  comment: string | null;
  created_at: string;
}

export interface BillingReference {
  id: string;
  company_id: string;
  provider: string;
  provider_customer_id: string | null;
  provider_invoice_id: string | null;
  invoice_type: string;
  amount_cents: number | null;
  currency: string;
  status: BillingStatus;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface AgreementReference {
  id: string;
  company_id: string;
  provider: string;
  provider_envelope_id: string | null;
  agreement_name: string;
  status: AgreementStatus;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface ReportingMetric {
  id: string;
  company_id: string;
  location_id: string | null;
  channel: string;
  metric_name: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  source: string;
  created_at: string;
}

export interface SessionUser {
  profile: Profile;
  companyIds: string[];
}
