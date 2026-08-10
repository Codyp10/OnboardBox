/**
 * Transactional email service boundary.
 * Stub implementation logs messages until a real provider is configured.
 */

import { demoDb, isDemoMode } from "@/lib/demo/store";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailService {
  send(message: EmailMessage): Promise<{ ok: true; id: string } | { ok: false; error: string }>;
}

class StubEmailService implements EmailService {
  async send(message: EmailMessage) {
    const id = `stub_email_${Date.now()}`;
    console.info("[email:stub]", { id, to: message.to, subject: message.subject });
    if (isDemoMode()) {
      demoDb.logEmail(message.to, message.subject, message.text ?? message.html);
    }
    return { ok: true as const, id };
  }
}

export const emailService: EmailService = new StubEmailService();

export async function sendInviteEmail(input: {
  to: string;
  companyName: string;
  inviteUrl: string;
}) {
  return emailService.send({
    to: input.to,
    subject: `You're invited to OnboardBox for ${input.companyName}`,
    text: `JMCG invited you to OnboardBox. Accept your invitation: ${input.inviteUrl}`,
    html: `<p>JMCG invited you to OnboardBox for <strong>${input.companyName}</strong>.</p><p><a href="${input.inviteUrl}">Accept invitation</a></p>`,
  });
}

export async function sendRequestNotification(input: {
  to: string;
  companyName: string;
  requestTitle: string;
  portalUrl: string;
}) {
  return emailService.send({
    to: input.to,
    subject: `Action required: ${input.requestTitle}`,
    text: `JMCG sent a request for ${input.companyName}: ${input.requestTitle}. Open OnboardBox: ${input.portalUrl}`,
    html: `<p>JMCG sent a new request for <strong>${input.companyName}</strong>.</p><p>${input.requestTitle}</p><p><a href="${input.portalUrl}">Open OnboardBox</a></p>`,
  });
}
