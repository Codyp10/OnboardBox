"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEMO_ADMIN_ID,
  DEMO_CLIENT_ID,
} from "@/lib/demo/seed";
import { demoDb, isDemoMode, resetDemoState } from "@/lib/demo/store";
import { DEMO_COOKIE, requireAdmin, requireCompanyAccess, requireUser } from "@/lib/auth/session";
import { sendInviteEmail, sendRequestNotification } from "@/lib/services/email";
import { startOAuth } from "@/lib/services/oauth";
import { confirmAgreementSigned, startAgreementSigning } from "@/lib/services/docusign";
import { confirmInvoicePaid, startInvoicePayment } from "@/lib/services/stripe";
import type { WebsitePlatform } from "@/lib/types/database";

async function setDemoUser(userId: string) {
  const jar = await cookies();
  jar.set(DEMO_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  demoDb.setCurrentUser(userId);
}

export async function demoLoginAction(formData: FormData) {
  if (!isDemoMode()) {
    throw new Error("Demo login is only available in demo mode");
  }
  const role = String(formData.get("role") ?? "client");
  const userId = role === "admin" ? DEMO_ADMIN_ID : DEMO_CLIENT_ID;
  await setDemoUser(userId);
  redirect(role === "admin" ? "/admin/companies" : "/home");
}

export async function demoLogoutAction() {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  demoDb.setCurrentUser(null);
  redirect("/login");
}

export async function resetDemoAction() {
  resetDemoState();
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  redirect("/login");
}

export async function createCompanyAction(formData: FormData) {
  await requireAdmin();
  if (!isDemoMode()) {
    throw new Error("Supabase company create not wired in this environment");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Company name is required");

  const serviceIds = formData.getAll("serviceIds").map(String);
  const locationName = String(formData.get("location_name") ?? "Primary Location");
  const company = demoDb.createCompany({
    name,
    legal_name: String(formData.get("legal_name") ?? "") || undefined,
    website: String(formData.get("website") ?? "") || undefined,
    primary_contact_email:
      String(formData.get("primary_contact_email") ?? "") || undefined,
    primary_contact_phone:
      String(formData.get("primary_contact_phone") ?? "") || undefined,
    serviceIds,
    locations: [
      {
        name: locationName,
        city: String(formData.get("city") ?? "") || undefined,
        state: String(formData.get("state") ?? "") || undefined,
      },
    ],
    approvals_enabled: formData.get("approvals_enabled") === "on",
  });

  revalidatePath("/admin/companies");
  redirect(`/admin/companies/${company.id}`);
}

export async function updateCompanyStatusAction(formData: FormData) {
  await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const status = String(formData.get("status"));
  demoDb.updateCompany(companyId, {
    status: status as "invited" | "onboarding" | "active" | "paused" | "former",
  });
  revalidatePath(`/admin/companies/${companyId}`);
}

export async function toggleApprovalsAction(formData: FormData) {
  await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const enabled = formData.get("enabled") === "true";
  demoDb.updateCompany(companyId, { approvals_enabled: enabled });
  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/approvals");
}

export async function updateStepFlagsAction(formData: FormData) {
  await requireAdmin();
  const stepId = String(formData.get("stepId"));
  const companyId = String(formData.get("companyId"));
  demoDb.updateStep(stepId, {
    required: formData.get("required") === "on",
    blocks_launch: formData.get("blocks_launch") === "on",
    title: String(formData.get("title") ?? undefined) || undefined,
  });
  revalidatePath(`/admin/companies/${companyId}/onboarding`);
  revalidatePath("/onboarding");
}

export async function addCustomStepAction(formData: FormData) {
  await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  demoDb.addCustomStep(companyId, title);
  revalidatePath(`/admin/companies/${companyId}/onboarding`);
}

export async function reorderStepAction(formData: FormData) {
  await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const stepId = String(formData.get("stepId"));
  const direction = String(formData.get("direction"));
  const data = demoDb.getOnboarding(companyId);
  if (!data) return;
  const ids = data.steps.map((s) => s.id);
  const index = ids.indexOf(stepId);
  if (index < 0) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ids.length) return;
  const next = [...ids];
  const [removed] = next.splice(index, 1);
  next.splice(target, 0, removed);
  demoDb.reorderSteps(companyId, next);
  revalidatePath(`/admin/companies/${companyId}/onboarding`);
}

export async function completeInstructionStepAction(formData: FormData) {
  const session = await requireUser();
  const stepId = String(formData.get("stepId"));
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  demoDb.completeStep(stepId, session.profile.id, "completed");
  revalidatePath("/onboarding");
  revalidatePath("/home");
}

export async function saveQuestionnaireAction(formData: FormData) {
  const session = await requireUser();
  const companyId = String(formData.get("companyId"));
  const questionnaireId = String(formData.get("questionnaireId"));
  const stepId = String(formData.get("stepId"));
  const submit = formData.get("submit") === "true";
  await requireCompanyAccess(companyId);

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q:")) continue;
    const questionId = key.slice(2);
    demoDb.saveQuestionnaireAnswer({
      questionnaireId,
      questionId,
      companyId,
      userId: session.profile.id,
      value: String(value),
      submit,
    });
  }

  if (submit) {
    demoDb.completeStep(stepId, session.profile.id, "completed");
  } else {
    demoDb.updateStep(stepId, { status: "in_progress" });
  }

  revalidatePath("/onboarding");
  revalidatePath(`/onboarding/${stepId}`);
}

export async function uploadFileAction(formData: FormData) {
  const session = await requireUser();
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const filename = String(formData.get("filename") ?? "").trim();
  if (!filename) return;
  const stepId = String(formData.get("stepId") ?? "") || undefined;
  demoDb.addFile({
    companyId,
    userId: session.profile.id,
    filename,
    mimeType: String(formData.get("mimeType") ?? "") || undefined,
    stepId,
  });
  if (stepId) {
    demoDb.completeStep(stepId, session.profile.id, "completed");
  }
  revalidatePath("/files");
  revalidatePath("/onboarding");
}

export async function createRequestAction(formData: FormData) {
  const session = await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const request = demoDb.createRequest({
    companyId,
    title,
    instructions: String(formData.get("instructions") ?? "") || undefined,
    required: formData.get("required") === "on",
    adminId: session.profile.id,
  });

  const company = demoDb.getCompany(companyId);
  if (company?.primary_contact_email) {
    await sendRequestNotification({
      to: company.primary_contact_email,
      companyName: company.name,
      requestTitle: request.title,
      portalUrl: "/home",
    });
  }

  revalidatePath(`/admin/companies/${companyId}/requests`);
  revalidatePath("/home");
}

export async function completeRequestAction(formData: FormData) {
  const session = await requireUser();
  const requestId = String(formData.get("requestId"));
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  demoDb.completeRequest(requestId, session.profile.id);
  revalidatePath("/home");
  revalidatePath(`/admin/companies/${companyId}/requests`);
}

export async function createInviteAction(formData: FormData) {
  const session = await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;
  const invite = demoDb.createInvite({
    companyId,
    email,
    adminId: session.profile.id,
  });
  const company = demoDb.getCompany(companyId);
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendInviteEmail({
    to: email,
    companyName: company?.name ?? "your company",
    inviteUrl: `${base}/invite/${invite.token}`,
  });
  revalidatePath(`/admin/companies/${companyId}`);
}

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token"));
  const result = demoDb.acceptInvite(token, {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  });
  if (!result) {
    throw new Error("Invite is invalid or expired");
  }
  await setDemoUser(result.profile.id);
  redirect("/home");
}

export async function setWebsitePlatformAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const stepId = String(formData.get("stepId"));
  const platform = String(formData.get("platform")) as WebsitePlatform;
  demoDb.setWebsitePlatform(stepId, platform);
  revalidatePath("/onboarding");
  revalidatePath(`/onboarding/${stepId}`);
}

export async function markWebsiteAccessAddedAction(formData: FormData) {
  const session = await requireUser();
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const stepId = String(formData.get("stepId"));
  demoDb.completeStep(stepId, session.profile.id, "waiting_verification");
  revalidatePath("/onboarding");
  revalidatePath(`/admin/companies/${companyId}/onboarding`);
}

export async function verifyWebsiteAccessAction(formData: FormData) {
  const session = await requireAdmin();
  const stepId = String(formData.get("stepId"));
  const companyId = String(formData.get("companyId"));
  const approve = formData.get("approve") === "true";
  demoDb.verifyStep(stepId, session.profile.id, approve);
  revalidatePath(`/admin/companies/${companyId}/onboarding`);
  revalidatePath("/onboarding");
}

export async function startConnectionAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const provider = String(formData.get("provider")) as
    | "google_ads"
    | "meta_ads"
    | "google_analytics"
    | "google_search_console"
    | "google_business_profile";
  const result = startOAuth(provider, companyId);
  redirect(result.authorizationUrl);
}

export async function createApprovalAction(formData: FormData) {
  const session = await requireAdmin();
  const companyId = String(formData.get("companyId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  demoDb.createApproval({
    companyId,
    title,
    description: String(formData.get("description") ?? "") || undefined,
    itemType: String(formData.get("item_type") ?? "generic"),
    adminId: session.profile.id,
  });
  revalidatePath(`/admin/companies/${companyId}/approvals`);
  revalidatePath("/approvals");
}

export async function approvalDecisionAction(formData: FormData) {
  const session = await requireUser();
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const approvalId = String(formData.get("approvalId"));
  const action = String(formData.get("action")) as "approve" | "request_changes";
  demoDb.actOnApproval({
    approvalId,
    userId: session.profile.id,
    action,
    comment: String(formData.get("comment") ?? "") || undefined,
  });
  revalidatePath("/approvals");
  revalidatePath(`/admin/companies/${companyId}/approvals`);
}

export async function startDocuSignAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const session = await startAgreementSigning(companyId);
  redirect(session.signingUrl);
}

export async function startStripeAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  await requireCompanyAccess(companyId);
  const session = await startInvoicePayment(companyId);
  redirect(session.checkoutUrl);
}

export async function stubCompleteDocuSignAction(companyId: string) {
  await confirmAgreementSigned(companyId);
  revalidatePath("/onboarding");
  revalidatePath("/billing");
}

export async function stubCompleteStripeAction(companyId: string) {
  await confirmInvoicePaid(companyId);
  revalidatePath("/onboarding");
  revalidatePath("/billing");
}
