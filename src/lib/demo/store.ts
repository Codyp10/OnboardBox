import { createInitialDemoState, type DemoState } from "@/lib/demo/seed";
import { isDemoMode } from "@/lib/demo/mode";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";
import type {
  Company,
  CompanyStatus,
  Invite,
  Location,
  OnboardingStep,
  Profile,
  StepStatus,
  WebsitePlatform,
} from "@/lib/types/database";
import { randomUUID } from "crypto";

export { isDemoMode };

const globalForDemo = globalThis as unknown as { __onboardboxDemo?: DemoState };

export function getDemoState(): DemoState {
  if (!globalForDemo.__onboardboxDemo) {
    globalForDemo.__onboardboxDemo = createInitialDemoState();
  }
  return globalForDemo.__onboardboxDemo;
}

export function resetDemoState() {
  globalForDemo.__onboardboxDemo = createInitialDemoState();
  return globalForDemo.__onboardboxDemo;
}

function refreshOnboarding(companyId: string) {
  const state = getDemoState();
  const onboarding = state.onboardings.find((o) => o.company_id === companyId);
  if (!onboarding) return;
  const steps = state.steps.filter((s) => s.onboarding_id === onboarding.id);
  const progress = calculateOnboardingProgress(steps);
  onboarding.completion_percentage = progress.completionPercentage;
  onboarding.ready_to_launch = progress.readyToLaunch;
  onboarding.status = progress.readyToLaunch
    ? "ready_to_launch"
    : progress.completionPercentage === 0
      ? "not_started"
      : "in_progress";
  onboarding.updated_at = new Date().toISOString();

  const company = state.companies.find((c) => c.id === companyId);
  if (company) {
    company.ready_to_launch = progress.readyToLaunch;
    if (progress.readyToLaunch && company.status === "onboarding") {
      // stay onboarding until admin activates
    }
    company.updated_at = new Date().toISOString();
  }
}

export const demoDb = {
  getCurrentUser(): Profile | null {
    const state = getDemoState();
    if (!state.currentUserId) return null;
    return state.profiles.find((p) => p.id === state.currentUserId) ?? null;
  },

  setCurrentUser(userId: string | null) {
    getDemoState().currentUserId = userId;
  },

  loginAs(email: string): Profile | null {
    const state = getDemoState();
    const profile = state.profiles.find(
      (p) => p.email.toLowerCase() === email.toLowerCase(),
    );
    if (!profile) return null;
    state.currentUserId = profile.id;
    return profile;
  },

  listCompanies() {
    return getDemoState().companies;
  },

  getCompany(id: string) {
    return getDemoState().companies.find((c) => c.id === id) ?? null;
  },

  getCompanyForUser(userId: string) {
    const state = getDemoState();
    const membership = state.memberships.find(
      (m) => m.user_id === userId && m.membership_status === "active",
    );
    if (!membership) return null;
    return state.companies.find((c) => c.id === membership.company_id) ?? null;
  },

  getMemberships(companyId: string) {
    const state = getDemoState();
    return state.memberships
      .filter((m) => m.company_id === companyId)
      .map((m) => ({
        ...m,
        profile: state.profiles.find((p) => p.id === m.user_id)!,
      }));
  },

  getLocations(companyId: string) {
    return getDemoState().locations.filter((l) => l.company_id === companyId);
  },

  getServices() {
    return getDemoState().services;
  },

  getCompanyServices(companyId: string) {
    const state = getDemoState();
    return state.companyServices
      .filter((cs) => cs.company_id === companyId)
      .map((cs) => ({
        ...cs,
        service: state.services.find((s) => s.id === cs.service_id)!,
      }));
  },

  getTemplates() {
    return getDemoState().templates.filter((t) => t.active);
  },

  getOnboarding(companyId: string) {
    const state = getDemoState();
    const onboarding = state.onboardings.find((o) => o.company_id === companyId);
    if (!onboarding) return null;
    const steps = state.steps
      .filter((s) => s.onboarding_id === onboarding.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    return { onboarding, steps };
  },

  createCompany(input: {
    name: string;
    legal_name?: string;
    website?: string;
    primary_contact_email?: string;
    primary_contact_phone?: string;
    serviceIds: string[];
    locations: Array<Partial<Location> & { name: string }>;
    approvals_enabled?: boolean;
  }) {
    const state = getDemoState();
    const ts = new Date().toISOString();
    const company: Company = {
      id: randomUUID(),
      name: input.name,
      legal_name: input.legal_name ?? null,
      website: input.website ?? null,
      status: "invited",
      ready_to_launch: false,
      approvals_enabled: input.approvals_enabled ?? false,
      primary_contact_email: input.primary_contact_email ?? null,
      primary_contact_phone: input.primary_contact_phone ?? null,
      notes: null,
      created_at: ts,
      updated_at: ts,
    };
    state.companies.push(company);

    input.locations.forEach((loc, index) => {
      state.locations.push({
        id: randomUUID(),
        company_id: company.id,
        name: loc.name,
        address_line1: loc.address_line1 ?? null,
        address_line2: loc.address_line2 ?? null,
        city: loc.city ?? null,
        state: loc.state ?? null,
        postal_code: loc.postal_code ?? null,
        country: loc.country ?? "US",
        phone: loc.phone ?? null,
        website: loc.website ?? null,
        service_area_notes: loc.service_area_notes ?? null,
        is_primary: index === 0,
        created_at: ts,
        updated_at: ts,
      });
    });

    input.serviceIds.forEach((serviceId) => {
      state.companyServices.push({
        id: randomUUID(),
        company_id: company.id,
        service_id: serviceId,
        status: "active",
        start_date: null,
        end_date: null,
        notes: null,
        created_at: ts,
      });
    });

    const onboardingId = randomUUID();
    state.onboardings.push({
      id: onboardingId,
      company_id: company.id,
      status: "not_started",
      completion_percentage: 0,
      ready_to_launch: false,
      started_at: null,
      completed_at: null,
      created_at: ts,
      updated_at: ts,
    });

    const selectedKeys = new Set(
      state.services
        .filter((s) => input.serviceIds.includes(s.id))
        .map((s) => s.key),
    );

    const templates = state.templates
      .filter((t) => t.active)
      .filter((t) => {
        if (!t.service_id) return true;
        const svc = state.services.find((s) => s.id === t.service_id);
        if (!svc) return true;
        if (svc.key === "website") return selectedKeys.has("website");
        if (svc.key === "meta_ads") return selectedKeys.has("meta_ads");
        if (svc.key === "google_ads")
          return (
            selectedKeys.has("google_ads") ||
            selectedKeys.has("google_business_profile") ||
            selectedKeys.has("seo")
          );
        return selectedKeys.has(svc.key);
      })
      .sort((a, b) => a.sort_order - b.sort_order);

    templates.forEach((tpl) => {
      const stepId = randomUUID();
      const metadata: Record<string, unknown> =
        tpl.name === "connect_google"
          ? { providers: ["google_ads"] }
          : tpl.name === "connect_meta"
            ? { providers: ["meta_ads"] }
            : {};
      state.steps.push({
        id: stepId,
        onboarding_id: onboardingId,
        company_id: company.id,
        template_id: tpl.id,
        service_id: tpl.service_id,
        title: tpl.default_title,
        description: tpl.default_description,
        step_type: tpl.default_step_type,
        sort_order: tpl.sort_order,
        required: tpl.default_required,
        blocks_launch: tpl.default_blocks_launch,
        depends_on_step_id: null,
        status: "not_started",
        instructional_video_url: tpl.instructional_video_url,
        external_url: tpl.external_url,
        website_platform: null,
        metadata,
        completed_at: null,
        completed_by_user_id: null,
        verified_at: null,
        verified_by_admin_id: null,
        created_at: ts,
        updated_at: ts,
      });

      if (tpl.default_step_type === "questionnaire") {
        const qId = randomUUID();
        state.questionnaires.push({
          id: qId,
          onboarding_step_id: stepId,
          company_id: company.id,
          name: tpl.default_title,
          version: 1,
          status: "active",
          created_at: ts,
        });
        const defaults =
          tpl.name === "company_info"
            ? [
                ["legal_name", "Legal business name", "text"],
                ["website", "Website URL", "text"],
                ["primary_phone", "Primary phone", "text"],
              ]
            : [
                ["priority_services", "Which services should we prioritize first?", "textarea"],
                ["service_areas", "Where do you want to generate leads?", "textarea"],
                ["monthly_budget", "Approximate monthly marketing budget", "text"],
              ];
        defaults.forEach(([key, prompt, type], i) => {
          state.questions.push({
            id: randomUUID(),
            questionnaire_id: qId,
            question_key: key,
            prompt,
            help_text: null,
            question_type: type,
            required: true,
            sort_order: (i + 1) * 10,
            configuration_json: {},
          });
        });
      }
    });

    if (selectedKeys.has("google_ads") || selectedKeys.has("seo")) {
      state.connections.push({
        id: randomUUID(),
        company_id: company.id,
        location_id: null,
        provider: "google_ads",
        connection_status: "not_connected",
        external_account_id: null,
        external_account_name: null,
        scopes: [],
        token_reference: null,
        token_expires_at: null,
        last_successful_sync_at: null,
        last_error_code: null,
        last_error_message: null,
        created_at: ts,
        updated_at: ts,
      });
    }
    if (selectedKeys.has("meta_ads")) {
      state.connections.push({
        id: randomUUID(),
        company_id: company.id,
        location_id: null,
        provider: "meta_ads",
        connection_status: "not_connected",
        external_account_id: null,
        external_account_name: null,
        scopes: [],
        token_reference: null,
        token_expires_at: null,
        last_successful_sync_at: null,
        last_error_code: null,
        last_error_message: null,
        created_at: ts,
        updated_at: ts,
      });
    }

    state.billing.push({
      id: randomUUID(),
      company_id: company.id,
      provider: "stripe",
      provider_customer_id: null,
      provider_invoice_id: null,
      invoice_type: "initial",
      amount_cents: null,
      currency: "usd",
      status: "draft",
      due_date: null,
      paid_at: null,
      created_at: ts,
    });

    state.agreements.push({
      id: randomUUID(),
      company_id: company.id,
      provider: "docusign",
      provider_envelope_id: null,
      agreement_name: "JMCG Marketing Services Agreement",
      status: "created",
      sent_at: null,
      signed_at: null,
      created_at: ts,
    });

    return company;
  },

  updateCompany(
    id: string,
    patch: Partial<Pick<Company, "name" | "status" | "approvals_enabled" | "notes" | "legal_name" | "website">>,
  ) {
    const company = this.getCompany(id);
    if (!company) return null;
    Object.assign(company, patch, { updated_at: new Date().toISOString() });
    return company;
  },

  updateStep(
    stepId: string,
    patch: Partial<
      Pick<
        OnboardingStep,
        | "title"
        | "description"
        | "required"
        | "blocks_launch"
        | "sort_order"
        | "status"
        | "website_platform"
        | "metadata"
      >
    >,
  ) {
    const state = getDemoState();
    const step = state.steps.find((s) => s.id === stepId);
    if (!step) return null;
    Object.assign(step, patch, { updated_at: new Date().toISOString() });
    refreshOnboarding(step.company_id);
    return step;
  },

  completeStep(stepId: string, userId: string, status: StepStatus = "completed") {
    const state = getDemoState();
    const step = state.steps.find((s) => s.id === stepId);
    if (!step) return null;
    step.status = status;
    step.completed_at =
      status === "completed" ? new Date().toISOString() : step.completed_at;
    step.completed_by_user_id = userId;
    step.updated_at = new Date().toISOString();
    refreshOnboarding(step.company_id);
    return step;
  },

  verifyStep(stepId: string, adminId: string, approve: boolean) {
    const state = getDemoState();
    const step = state.steps.find((s) => s.id === stepId);
    if (!step) return null;
    if (approve) {
      step.status = "completed";
      step.verified_at = new Date().toISOString();
      step.verified_by_admin_id = adminId;
      step.completed_at = step.completed_at ?? new Date().toISOString();
    } else {
      step.status = "correction_requested";
      step.verified_at = null;
      step.verified_by_admin_id = null;
    }
    step.updated_at = new Date().toISOString();
    refreshOnboarding(step.company_id);
    return step;
  },

  setWebsitePlatform(stepId: string, platform: WebsitePlatform) {
    return this.updateStep(stepId, {
      website_platform: platform,
      status: "in_progress",
    });
  },

  getQuestionnaireForStep(stepId: string) {
    const state = getDemoState();
    const questionnaire = state.questionnaires.find(
      (q) => q.onboarding_step_id === stepId,
    );
    if (!questionnaire) return null;
    const questions = state.questions
      .filter((q) => q.questionnaire_id === questionnaire.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const responses = state.responses.filter(
      (r) => r.questionnaire_id === questionnaire.id,
    );
    return { questionnaire, questions, responses };
  },

  saveQuestionnaireAnswer(input: {
    questionnaireId: string;
    questionId: string;
    companyId: string;
    userId: string;
    value: string;
    submit?: boolean;
  }) {
    const state = getDemoState();
    const existing = state.responses.find(
      (r) =>
        r.questionnaire_id === input.questionnaireId &&
        r.question_id === input.questionId,
    );
    const ts = new Date().toISOString();
    if (existing) {
      if (
        existing.submitted_at &&
        existing.value !== input.value &&
        existing.value != null
      ) {
        state.responseHistory.push({
          id: randomUUID(),
          response_id: existing.id,
          previous_value: existing.value,
          new_value: input.value,
          changed_by_user_id: input.userId,
          changed_at: ts,
        });
      }
      existing.value = input.value;
      existing.user_id = input.userId;
      existing.updated_at = ts;
      if (input.submit) existing.submitted_at = existing.submitted_at ?? ts;
      return existing;
    }
    const created = {
      id: randomUUID(),
      questionnaire_id: input.questionnaireId,
      question_id: input.questionId,
      company_id: input.companyId,
      user_id: input.userId,
      value: input.value,
      submitted_at: input.submit ? ts : null,
      updated_at: ts,
    };
    state.responses.push(created);
    return created;
  },

  listFiles(companyId: string) {
    return getDemoState().files.filter((f) => f.company_id === companyId);
  },

  addFile(input: {
    companyId: string;
    userId: string;
    filename: string;
    mimeType?: string;
    sizeBytes?: number;
    stepId?: string;
    requestId?: string;
  }) {
    const asset = {
      id: randomUUID(),
      company_id: input.companyId,
      onboarding_step_id: input.stepId ?? null,
      request_id: input.requestId ?? null,
      uploaded_by_user_id: input.userId,
      storage_provider: "demo",
      storage_key: `${input.companyId}/${randomUUID()}/${input.filename}`,
      original_filename: input.filename,
      mime_type: input.mimeType ?? null,
      size_bytes: input.sizeBytes ?? null,
      created_at: new Date().toISOString(),
    };
    getDemoState().files.push(asset);
    return asset;
  },

  listRequests(companyId: string) {
    return getDemoState().requests.filter((r) => r.company_id === companyId);
  },

  createRequest(input: {
    companyId: string;
    title: string;
    instructions?: string;
    required?: boolean;
    adminId: string;
    serviceId?: string;
  }) {
    const req = {
      id: randomUUID(),
      company_id: input.companyId,
      service_id: input.serviceId ?? null,
      title: input.title,
      instructions: input.instructions ?? null,
      required: input.required ?? true,
      status: "open" as const,
      created_by_admin_id: input.adminId,
      completed_by_user_id: null,
      due_date: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    getDemoState().requests.push(req);
    return req;
  },

  completeRequest(requestId: string, userId: string) {
    const req = getDemoState().requests.find((r) => r.id === requestId);
    if (!req) return null;
    req.status = "completed";
    req.completed_by_user_id = userId;
    req.completed_at = new Date().toISOString();
    return req;
  },

  createInvite(input: {
    companyId: string;
    email: string;
    adminId: string;
  }): Invite {
    const invite: Invite = {
      id: randomUUID(),
      company_id: input.companyId,
      email: input.email.toLowerCase(),
      token: randomUUID().replace(/-/g, ""),
      status: "pending",
      invited_by_admin_id: input.adminId,
      accepted_by_user_id: null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      accepted_at: null,
    };
    getDemoState().invites.push(invite);
    const company = this.getCompany(input.companyId);
    if (company && company.status === "invited") {
      // keep invited until accept
    }
    return invite;
  },

  getInviteByToken(token: string) {
    return getDemoState().invites.find((i) => i.token === token) ?? null;
  },

  listInvites(companyId: string) {
    return getDemoState().invites.filter((i) => i.company_id === companyId);
  },

  acceptInvite(token: string, profileInput: {
    first_name: string;
    last_name: string;
    email: string;
  }) {
    const state = getDemoState();
    const invite = state.invites.find((i) => i.token === token);
    if (!invite || invite.status !== "pending") return null;
    if (new Date(invite.expires_at) < new Date()) {
      invite.status = "expired";
      return null;
    }
    const ts = new Date().toISOString();
    let profile = state.profiles.find(
      (p) => p.email.toLowerCase() === profileInput.email.toLowerCase(),
    );
    if (!profile) {
      profile = {
        id: randomUUID(),
        first_name: profileInput.first_name,
        last_name: profileInput.last_name,
        email: profileInput.email.toLowerCase(),
        phone: null,
        user_type: "client",
        created_at: ts,
        updated_at: ts,
      };
      state.profiles.push(profile);
    }
    const existingMembership = state.memberships.find(
      (m) => m.company_id === invite.company_id && m.user_id === profile!.id,
    );
    if (!existingMembership) {
      state.memberships.push({
        id: randomUUID(),
        company_id: invite.company_id,
        user_id: profile.id,
        membership_status: "active",
        created_at: ts,
      });
    }
    invite.status = "accepted";
    invite.accepted_at = ts;
    invite.accepted_by_user_id = profile.id;
    const company = state.companies.find((c) => c.id === invite.company_id);
    if (company && (company.status === "invited" || company.status === "former")) {
      company.status = "onboarding" as CompanyStatus;
      company.updated_at = ts;
    }
    state.currentUserId = profile.id;
    return { profile, company };
  },

  listConnections(companyId: string) {
    return getDemoState().connections.filter((c) => c.company_id === companyId);
  },

  stubConnect(provider: string, companyId: string) {
    const state = getDemoState();
    let conn = state.connections.find(
      (c) => c.company_id === companyId && c.provider === provider,
    );
    const ts = new Date().toISOString();
    if (!conn) {
      conn = {
        id: randomUUID(),
        company_id: companyId,
        location_id: null,
        provider,
        connection_status: "connected",
        external_account_id: `${provider}_demo_account`,
        external_account_name: `Demo ${provider} account`,
        scopes: ["readonly"],
        token_reference: `demo-token-ref-${provider}`,
        token_expires_at: null,
        last_successful_sync_at: ts,
        last_error_code: null,
        last_error_message: null,
        created_at: ts,
        updated_at: ts,
      };
      state.connections.push(conn);
    } else {
      conn.connection_status = "connected";
      conn.external_account_id = `${provider}_demo_account`;
      conn.external_account_name = `Demo ${provider} account`;
      conn.token_reference = `demo-token-ref-${provider}`;
      conn.last_successful_sync_at = ts;
      conn.last_error_code = null;
      conn.last_error_message = null;
      conn.updated_at = ts;
    }

    // Complete related connection steps when all providers connected for that step
    const steps = state.steps.filter(
      (s) => s.company_id === companyId && s.step_type === "connection",
    );
    for (const step of steps) {
      const providers = (step.metadata.providers as string[] | undefined) ?? [];
      if (providers.length === 0) {
        if (
          (provider.startsWith("google") && step.title.toLowerCase().includes("google")) ||
          (provider.startsWith("meta") && step.title.toLowerCase().includes("meta"))
        ) {
          this.completeStep(step.id, state.currentUserId!, "completed");
        }
      } else if (
        providers.every((p) =>
          state.connections.some(
            (c) =>
              c.company_id === companyId &&
              c.provider === p &&
              c.connection_status === "connected",
          ),
        )
      ) {
        this.completeStep(step.id, state.currentUserId!, "completed");
      }
    }
    return conn;
  },

  listApprovals(companyId: string) {
    return getDemoState().approvals.filter((a) => a.company_id === companyId);
  },

  listApprovalActions(approvalId: string) {
    return getDemoState().approvalActions.filter((a) => a.approval_id === approvalId);
  },

  createApproval(input: {
    companyId: string;
    title: string;
    description?: string;
    itemType?: string;
    adminId: string;
  }) {
    const approval = {
      id: randomUUID(),
      company_id: input.companyId,
      service_id: null,
      title: input.title,
      description: input.description ?? null,
      item_type: input.itemType ?? "generic",
      preview_url: null,
      status: "pending" as const,
      created_by_admin_id: input.adminId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    getDemoState().approvals.push(approval);
    return approval;
  },

  actOnApproval(input: {
    approvalId: string;
    userId: string;
    action: "approve" | "request_changes";
    comment?: string;
  }) {
    const state = getDemoState();
    const approval = state.approvals.find((a) => a.id === input.approvalId);
    if (!approval) return null;
    approval.status =
      input.action === "approve" ? "approved" : "changes_requested";
    approval.updated_at = new Date().toISOString();
    state.approvalActions.push({
      id: randomUUID(),
      approval_id: approval.id,
      user_id: input.userId,
      action: input.action,
      comment: input.comment ?? null,
      created_at: new Date().toISOString(),
    });
    return approval;
  },

  listBilling(companyId: string) {
    return getDemoState().billing.filter((b) => b.company_id === companyId);
  },

  listAgreements(companyId: string) {
    return getDemoState().agreements.filter((a) => a.company_id === companyId);
  },

  markAgreementSigned(companyId: string) {
    const state = getDemoState();
    const agreement = state.agreements.find((a) => a.company_id === companyId);
    if (!agreement) return null;
    agreement.status = "completed";
    agreement.signed_at = new Date().toISOString();
    agreement.provider_envelope_id =
      agreement.provider_envelope_id ?? `env_${companyId.slice(0, 8)}`;
    const step = state.steps.find(
      (s) => s.company_id === companyId && s.step_type === "agreement",
    );
    if (step && state.currentUserId) {
      this.completeStep(step.id, state.currentUserId, "completed");
    }
    return agreement;
  },

  markInvoicePaid(companyId: string) {
    const state = getDemoState();
    const invoice = state.billing.find(
      (b) => b.company_id === companyId && b.invoice_type === "initial",
    );
    if (!invoice) return null;
    invoice.status = "paid";
    invoice.paid_at = new Date().toISOString();
    invoice.provider_invoice_id =
      invoice.provider_invoice_id ?? `in_${companyId.slice(0, 8)}`;
    const step = state.steps.find(
      (s) => s.company_id === companyId && s.step_type === "payment",
    );
    if (step && state.currentUserId) {
      this.completeStep(step.id, state.currentUserId, "completed");
    }
    return invoice;
  },

  listMetrics(companyId: string) {
    return getDemoState().metrics.filter((m) => m.company_id === companyId);
  },

  logEmail(to: string, subject: string, body: string) {
    getDemoState().emailLog.push({
      to,
      subject,
      body,
      at: new Date().toISOString(),
    });
  },

  getEmailLog() {
    return getDemoState().emailLog;
  },

  reorderSteps(companyId: string, orderedIds: string[]) {
    const state = getDemoState();
    orderedIds.forEach((id, index) => {
      const step = state.steps.find(
        (s) => s.id === id && s.company_id === companyId,
      );
      if (step) {
        step.sort_order = (index + 1) * 10;
        step.updated_at = new Date().toISOString();
      }
    });
    return this.getOnboarding(companyId);
  },

  addCustomStep(companyId: string, title: string) {
    const state = getDemoState();
    const onboarding = state.onboardings.find((o) => o.company_id === companyId);
    if (!onboarding) return null;
    const maxSort = Math.max(
      0,
      ...state.steps
        .filter((s) => s.onboarding_id === onboarding.id)
        .map((s) => s.sort_order),
    );
    const step: OnboardingStep = {
      id: randomUUID(),
      onboarding_id: onboarding.id,
      company_id: companyId,
      template_id: null,
      service_id: null,
      title,
      description: null,
      step_type: "custom",
      sort_order: maxSort + 10,
      required: false,
      blocks_launch: false,
      depends_on_step_id: null,
      status: "not_started",
      instructional_video_url: null,
      external_url: null,
      website_platform: null,
      metadata: {},
      completed_at: null,
      completed_by_user_id: null,
      verified_at: null,
      verified_by_admin_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.steps.push(step);
    refreshOnboarding(companyId);
    return step;
  },
};
