# Vercel deploy checklist

## 1. Project settings

- Framework Preset: **Next.js**
- Root Directory: repo root
- Build Command: `npm run build` (default)
- Install Command: `npm install` (default)
- Branch: `cursor/onboardbox-v1-bef3` (or `main` after merge)

## 2. Environment variables (Production + Preview)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rtbxdwhpcmztcvtdlyys.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (server only) |
| `NEXT_PUBLIC_DEMO_MODE` | `false` for real Auth (`true` only if you want demo shortcuts) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

Redeploy after saving env vars.

## 3. Supabase Auth URL config

In Supabase → Authentication → URL Configuration:

- **Site URL:** your Vercel production URL
- **Redirect URLs:** include
  - `https://your-app.vercel.app/**`
  - `https://your-app.vercel.app/auth/callback`
  - local: `http://localhost:3000/**` if still developing locally

## 4. First admin user

1. Open the deployed site → Sign up (or invite flow)
2. Confirm email if required
3. In Supabase SQL Editor:

```sql
update public.profiles
set user_type = 'admin'
where email = 'your-admin@email.com';
```

4. Sign in again → should land on `/admin/companies`

## 5. Important behavior note

Most portal pages still use the **demo data store** for companies/onboarding content until Supabase-backed data access is wired end-to-end. Auth can be real while some screens still show demo seed data. That follow-up is separate from getting the Vercel deploy live.
