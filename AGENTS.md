# OnboardBox Agent Instructions

OnboardBox is a client-facing onboarding and reporting portal used by JMCG.

## Before Implementing Substantial Changes

Read the relevant source-of-truth documents:

1. `docs/PRODUCT_SPEC.md`
2. `docs/USER_FLOWS.md`
3. `docs/DECISIONS.md`
4. `docs/DATA_MODEL.md`
5. `docs/INTEGRATIONS.md` when working with external services
6. `docs/DESIGN_SYSTEM.md` when working on UI
7. `docs/ROADMAP.md` to understand current scope

## Product Philosophy

- Do not invent new product requirements.
- Do not add features simply because they are common in SaaS products.
- Keep V1 focused.
- Prefer simple, maintainable implementations.
- OnboardBox should orchestrate existing systems rather than unnecessarily replace them.
- Client communication remains email and phone.
- OnboardBox is not a CRM.
- Individual lead records are out of scope for V1.
- AI summaries are out of scope for V1.
- The product is currently for JMCG and its clients only.

If a requested implementation conflicts with the product documents, identify the conflict before changing architecture.

## Multi-Tenant Safety

- Every client-owned record must belong to a company.
- A client user must never access another company's data.
- Authorization must be enforced server-side, not only hidden in the UI.
- Multiple users may belong to one company.
- Companies may have multiple locations.

## Integrations and Secrets

- Never store third-party passwords.
- Prefer OAuth or official authorization flows where available.
- Never expose private API keys, service-role credentials, OAuth secrets, or refresh tokens in client-side code.
- Never store raw payment-card data.
- Use Stripe for payment processing.
- Use DocuSign for electronic signatures.

## Development Behavior

- Do not make destructive database changes without identifying them first.
- Do not modify unrelated functionality while implementing a feature.
- Do not silently weaken authorization or validation for convenience.
- Prefer migrations that preserve existing data.
- Keep external integrations behind clear service boundaries.
- Make failure states visible and recoverable.

## Documentation

When a product, data-model, integration, or architecture decision changes, update the appropriate file in `/docs`.

Add significant settled decisions to `docs/DECISIONS.md`.

## Cursor Cloud specific instructions

Stack: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + Supabase. It is a single service. Standard commands live in `package.json`: `npm run dev`, `npm run lint`, `npm run build`.

- The update script installs deps (`npm install`). It does not create `.env.local`; copy it once with `cp .env.example .env.local` if it is missing.
- Demo mode: with no Supabase env vars set, the app auto-runs in demo mode (`NEXT_PUBLIC_DEMO_MODE=true`) backed by an in-memory store. No database is required to develop or exercise flows. Demo data is in-memory only and resets whenever the dev server restarts.
- Log in from `/login` with the demo buttons: "Continue as JMCG admin" (admin flows) or "Continue as demo client" (client flows). Unauthenticated visits to `/` redirect to `/login`.
- To run against real Supabase instead of demo mode, follow `docs/SETUP_SUPABASE.md` and set the Supabase env vars plus `NEXT_PUBLIC_DEMO_MODE=false`.
- `next dev` automatically re-adds the `<!-- BEGIN:nextjs-agent-rules -->` block below to this file on every run. It is expected; commit it so the working tree stays clean.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
