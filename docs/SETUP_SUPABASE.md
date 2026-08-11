# Supabase Setup for OnboardBox

## Cursor MCP (this repo)

`.cursor/mcp.json` is configured for project `rtbxdwhpcmztcvtdlyys`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=rtbxdwhpcmztcvtdlyys&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
    }
  }
}
```

Agent skills are installed under `.agents/skills/` (`supabase`, `supabase-postgres-best-practices`).

**Auth note:** Supabase MCP uses OAuth. Authenticate it in **Cursor Desktop** (Settings → MCP → Supabase). Cloud agents cannot complete interactive MCP login; after desktop auth, restart/retry the agent so tools become available.

Expected project URL once wired: `https://rtbxdwhpcmztcvtdlyys.supabase.co`

## Required app secrets (minimum to leave demo mode)

| Secret | Where to find it | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL | Browser + server Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key | Auth + RLS-scoped client access |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key | Server-only admin tasks (never expose to browser) |

Also set:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | `false` once the three secrets above are present |
| `NEXT_PUBLIC_APP_URL` | App origin, e.g. `http://localhost:3000` or your Vercel URL |

## One-time project setup in Supabase

1. Open the OnboardBox Supabase project (`rtbxdwhpcmztcvtdlyys`).
2. Run the SQL migration: `supabase/migrations/20260810000000_init.sql`  
   (via authenticated MCP `apply_migration` / `execute_sql`, SQL Editor, or `supabase db push`).
3. Confirm Auth → Providers: **Email** enabled (invite acceptance / login).
4. Confirm Storage: migration creates private bucket `company-files` with company-scoped policies.
5. Optional: create the first JMCG admin by signing up a user, then in SQL:

```sql
update public.profiles
set user_type = 'admin'
where email = 'your-admin@jmcg.example';
```

## Not required yet (still stubbed)

Leave these empty until you intentionally wire them:

- Email: `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`
- Google OAuth: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- Meta OAuth: `META_OAUTH_APP_ID`, `META_OAUTH_APP_SECRET`
- DocuSign / Stripe (Phase 10 last): see `.env.example`

## After secrets + MCP auth are available

1. Set `NEXT_PUBLIC_DEMO_MODE=false`.
2. Restart the app / cloud agent so env vars load.
3. Apply the migration if not already applied.
4. Create an admin profile, then exercise `/login` against real Auth.
