# OnboardBox Roadmap

This roadmap is directional. Build the smallest stable foundation first.

## Phase 0 — Planning

- Finalize product spec
- Finalize initial data model
- Choose technical stack
- Choose authentication approach
- Choose file storage
- Choose deployment/hosting
- Define environment strategy
- Define development/staging/production safety

## Phase 1 — Foundation

- Application shell
- Authentication
- Admin vs client authorization
- Company model
- Company memberships
- Multiple client users
- Location support
- Service catalog
- Client status
- Basic portal navigation
- Admin client list
- Admin company detail

Success criteria:

An admin can create a client company, add locations/services/users, and the authenticated client can only access their own company.

## Phase 2 — Onboarding Engine

- Onboarding instance
- Reusable step templates
- Step builder/editor
- Add/remove/reorder steps
- Required toggle
- Blocks-launch toggle
- Dependencies
- Progress calculation
- Ready-to-Launch logic
- Client onboarding UI
- Admin onboarding view
- Manual verification states

Success criteria:

Admin can create a customized onboarding sequence and client can complete it safely.

## Phase 3 — Questionnaires and Files

- Base questionnaire
- Service-specific questions
- Autosave
- Save and return
- Submission
- Post-submission editing
- Last-updated tracking
- Change history
- File upload area
- Client requests

Success criteria:

A client can provide the majority of business/marketing information and assets without external Google Forms/Drive links.

## Phase 4 — Invitations and Notifications

- Manual invite generation
- Secure invite acceptance
- Additional company users
- Transactional email
- New request notifications
- Important onboarding status notifications

Do not add internal chat.

## Phase 5 — Website Access Guidance

- Platform selection
- WordPress instructions
- Webflow instructions
- Shopify instructions
- Squarespace instructions
- Wix instructions
- GoDaddy instructions
- Other/unknown path
- Instructional videos
- Client-marked complete
- JMCG verification
- Correction requested

## Phase 6 — Account Connections

- Google OAuth foundation
- Google Ads
- Google Business Profile
- Google Analytics
- Google Search Console
- Google LSA as current API capabilities permit
- Meta authorization
- Connection health/status
- Reconnect flow

Implement providers incrementally rather than all at once.

## Phase 7 — Long-Term Client Portal

- Home dashboard
- Onboarding history
- Files
- Billing
- Account
- Outstanding requests

## Phase 8 — Reporting

Start with top-level KPIs.

Paid media:

- Spend
- Leads/conversions where correctly defined
- CPL
- Clicks
- Impressions

SEO/GEO/GBP:

Use channel-appropriate metrics.

Do not build individual lead views in V1.

## Phase 9 — Approvals

- Per-client approvals enabled/disabled
- Generic approval item
- Attach/preview item
- Approve
- Request changes
- Approval history

## Phase 10 — DocuSign and Stripe (last)

- DocuSign agreement integration
- Signature status
- Stripe customer/invoice references
- Initial payment flow
- Payment status
- Blocking behavior based on verified status

Success criteria:

OnboardBox can reliably know whether required agreement/payment steps are complete.

Build these after phases 1–9. Until real keys exist, keep orchestration behind service stubs that never store card data or provider passwords.

## Explicitly Deferred

- Native Flutter/mobile app
- Internal client chat
- Individual lead records
- CRM
- AI reporting summaries
- Selling OnboardBox to other agencies
- Complex internal JMCG project management
