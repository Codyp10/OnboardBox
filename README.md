# OnboardBox

OnboardBox is a private client onboarding and marketing reporting portal for JMCG and its clients.

The product is intended to make the beginning and ongoing management of a client relationship simpler by giving clients one place to:

- Complete onboarding
- Sign agreements
- Pay invoices
- Complete questionnaires
- Upload files
- Connect marketing accounts
- Follow guided website-access instructions
- View high-level marketing reporting
- Review approvals when enabled
- Access billing and account information

OnboardBox is not intended to replace JMCG's existing software stack. It is the client-facing orchestration layer that sits on top of tools such as DocuSign, Stripe, Google, Meta, and other systems.

## Stack

- Next.js App Router (TypeScript)
- Tailwind CSS
- Supabase (Auth, Postgres + RLS, Storage)
- Vercel

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

With no Supabase credentials configured, the app runs in **demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`) using an in-memory data store so you can exercise admin and client flows locally.

Demo users:

- Client: continue as demo client on `/login`
- Admin: continue as JMCG admin on `/login`

## Supabase

Apply the SQL migration in `supabase/migrations/20260810000000_init.sql` to your Supabase project, then set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_DEMO_MODE=false`

Full checklist: `docs/SETUP_SUPABASE.md`.

## Integration stubs

These stay behind service boundaries until real keys exist:

- `src/lib/services/email.ts`
- `src/lib/services/oauth.ts`
- `src/lib/services/reporting.ts`
- `src/lib/services/docusign.ts` (Phase 10 — last)
- `src/lib/services/stripe.ts` (Phase 10 — last)

## Documentation

Before making major product or architecture changes, read:

1. `docs/PRODUCT_SPEC.md`
2. `docs/USER_FLOWS.md`
3. `docs/DATA_MODEL.md`
4. `docs/INTEGRATIONS.md`
5. `docs/ROADMAP.md`
6. `docs/DECISIONS.md`
7. `docs/DESIGN_SYSTEM.md`

Cursor-specific instructions live in `AGENTS.md` and `.cursor/rules/`.
