# OnboardBox Decisions

This file records settled product decisions so they are not repeatedly re-litigated or silently changed by implementation.

## 2026-08-10 — Product Name

Decision:
Use `OnboardBox` as the working product name.

Status:
Working name; may change later.

## 2026-08-10 — Initial Audience

Decision:
OnboardBox is for JMCG and JMCG clients only.

It is not being built as a multi-agency SaaS product in V1.

## 2026-08-10 — Product Role

Decision:
OnboardBox will sit on top of existing tools rather than replace them.

Examples:
- DocuSign remains e-signature provider
- Stripe remains payment provider
- Existing marketing platforms remain systems of record

## 2026-08-10 — Client Invites

Decision:
Client invitations will initially be sent manually by a JMCG administrator.

## 2026-08-10 — Multiple Client Users

Decision:
Multiple people from the same client company may have separate OnboardBox accounts.

In V1 they can see the same authorized company-level portal data.

## 2026-08-10 — Navigation

Decision:
All clients use the same main portal navigation in V1.

Current sections:
- Home
- Onboarding
- Reporting
- Approvals
- Files
- Billing
- Account

## 2026-08-10 — Files

Decision:
Clients see one simple upload area in V1 rather than a complicated folder structure.

## 2026-08-10 — Questionnaires

Decision:
Questionnaires autosave so clients can leave and return.

## 2026-08-10 — Questionnaire Editing

Decision:
Questionnaire responses can be edited after submission by default.

OnboardBox should show last-updated information and preserve meaningful change history.

An admin-finalization/locking capability can be added if needed.

## 2026-08-10 — Onboarding Configuration

Decision:
Administrators can manually add, remove, and reorder onboarding steps.

Service selection may generate suggested steps but does not lock the admin into them.

## 2026-08-10 — Blocking

Decision:
Onboarding blocking behavior must be configurable.

Each step can independently define:
- Required
- Blocks Launch
- Optional dependency

Not every onboarding process must be strictly sequential.

## 2026-08-10 — Ready to Launch

Decision:
`Ready to Launch` is based on completion of all steps marked as launch-blocking, not merely 100% of every optional step.

## 2026-08-10 — Instructional Videos

Decision:
Onboarding/manual access steps can include instructional videos.

## 2026-08-10 — Post-Onboarding Use

Decision:
OnboardBox remains useful after onboarding as the client's ongoing portal.

## 2026-08-10 — Reporting Detail

Decision:
V1 reporting is high-level KPI reporting.

Do not display individual lead records, call recordings, or detailed CRM pipeline data.

## 2026-08-10 — AI Reporting

Decision:
Do not include AI-generated performance summaries in V1.

## 2026-08-10 — Approvals

Decision:
Build approvals as an optional feature that can be enabled or disabled.

Prefer a generic approval system rather than separate approval products for each service.

## 2026-08-10 — Client Requests

Decision:
JMCG can send structured requests/tasks to clients during or after onboarding.

This does not constitute an internal messaging system.

## 2026-08-10 — Communication

Decision:
Client communication remains through email and phone.

Do not build client chat in V1.

## 2026-08-10 — Internal Users

Decision:
The product is client-facing with a JMCG admin view.

Do not turn V1 into a full internal agency operating system.

## 2026-08-10 — Multi-Location Support

Decision:
Support multiple company locations in the data model from day one.

Most current clients have one location, but at least one current client has two.

## 2026-08-10 — Integrations

Decision:
OnboardBox should aim to support:
- Meta Ads
- Google Ads
- Google LSA
- SEO-related sources
- GEO-related reporting sources as defined later
- Google Business Profile
- Website access workflows
- Podcast-editing onboarding

Email marketing is not a supported service category in the current scope.

## 2026-08-10 — Website Access

Decision:
There is no universal website-access connector in V1.

Use platform-specific guided instructions and manual verification when necessary.

## 2026-08-10 — Technology Stack

Decision:
Use the following stack for V1:

- Next.js App Router (TypeScript)
- Tailwind CSS
- Supabase (Auth, Postgres + RLS, Storage)
- Vercel hosting

The product is web-first. Native Flutter/mobile apps are out of scope for V1.

## 2026-08-10 — Integration Build Order

Decision:
DocuSign and Stripe orchestration are implemented last in the V1 build sequence, after foundation, onboarding, questionnaires/files/requests, invites/email, website access, connection stubs, portal home, reporting, and approvals.

Google/Meta OAuth, transactional email, and reporting APIs are stubbed behind clear service boundaries until real credentials exist.

## 2026-08-10 — File Storage Provider

Decision:
Use Supabase Storage for V1 client file uploads.

Files remain private by default and company-scoped via server-side authorization and storage policies.
