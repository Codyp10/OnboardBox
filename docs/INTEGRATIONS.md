# OnboardBox Integrations

This document captures intended integration behavior. Exact API capabilities and permission requirements must be verified against current official documentation before implementation.

## Integration Philosophy

OnboardBox is the client-facing orchestration layer.

It should use existing specialized platforms where appropriate instead of recreating them.

Key rules:

- Never collect third-party passwords when OAuth or official authorization is available.
- Never store raw card information.
- Keep provider secrets server-side.
- Handle token expiration/revocation.
- Make integration failures visible and recoverable.
- Use webhooks where appropriate, but validate webhook authenticity.
- Do not mark a process complete based only on a browser redirect.

## 1. DocuSign

Purpose:

- Client contract signing

Desired flow:

OnboardBox
→ Create/open DocuSign signing process
→ Client signs in DocuSign
→ DocuSign webhook/status confirmation
→ OnboardBox marks agreement signed

OnboardBox does not implement its own e-signature engine.

Data to retain:

- Provider envelope/document reference
- Status
- Sent date
- Signed date

## 2. Stripe

Purpose:

- Initial invoice/payment
- Ongoing billing visibility where useful

Desired flow:

OnboardBox
→ Stripe payment/invoice flow
→ Client pays through Stripe
→ Stripe webhook/server verification
→ OnboardBox updates payment status

Rules:

- Do not store card numbers
- Do not store CVV
- Prefer Stripe-hosted/secure payment elements and official APIs
- Treat Stripe as payment source of truth

## 3. Google Identity / OAuth

Potential purpose:

Allow a client to authorize access to relevant Google services without giving JMCG their password.

Potential Google services:

- Google Ads
- Google Business Profile
- Google Analytics
- Google Search Console
- Google Local Services Ads, subject to actual API/permission capabilities

Desired client experience:

Connect Google
→ Google authorization
→ Return to OnboardBox
→ Discover/select relevant accounts/properties
→ Store authorized connection securely

Do not request broader scopes than necessary.

## 4. Google Ads

Purposes:

- Access/account authorization where supported
- High-level reporting

Potential reporting:

- Spend
- Leads/conversions where correctly configured
- Cost per lead/conversion
- Clicks
- Impressions

Exact conversion definitions must be handled carefully.

## 5. Google Local Services Ads

Purposes:

- Onboarding/access guidance
- Reporting where current APIs permit

Important:

Do not assume LSA supports every administrative permission through the same flow as Google Ads.

Verify current official API capabilities before implementation.

Potential reporting:

- Spend
- Charged leads
- Cost per lead
- Other available account-performance metrics

## 6. Google Business Profile

Purposes:

- Account/property authorization where supported
- High-level reporting

Potential metrics, subject to API availability:

- Calls/interactions
- Website interactions
- Direction requests
- Profile visibility

Account/property selection must support multi-location businesses.

## 7. Google Analytics

Potential purpose:

- Website reporting
- SEO reporting support

Potential metrics:

- Users
- Sessions
- Organic traffic
- Conversions/events where configured

Do not assume every client has GA4 configured correctly.

## 8. Google Search Console

Purpose:

- SEO reporting

Potential metrics:

- Search clicks
- Search impressions
- CTR
- Average position
- Query/page visibility

## 9. Meta

Purposes:

- Client authorization
- Meta Ads reporting

Desired flow:

Connect Meta
→ Official Meta authorization
→ Select/confirm business/ad account
→ Securely store authorized connection
→ Show connection status

Potential reporting:

- Spend
- Leads/results where correctly configured
- Cost per result
- Clicks
- Impressions

Meta permissions and app review requirements must be verified before implementation.

## 10. Website Access

There is no universal website-admin connector in V1.

Supported guided platforms should include:

- WordPress
- Webflow
- Shopify
- Squarespace
- Wix
- GoDaddy
- Other
- I don't know

Flow:

Client selects platform
→ OnboardBox shows platform-specific instructions
→ Optional instructional video
→ Client performs external invite/access step
→ Client marks done
→ JMCG verifies access

Never ask users to paste a sensitive website password into an ordinary OnboardBox form.

Prefer platform collaborator/invite mechanisms.

## 11. File Storage

Final provider is not selected yet.

Requirements:

- Private by default
- Company-scoped access
- Secure upload URLs/process
- Supports common images, video, branding, and documents
- Files should not be publicly guessable
- Server authorization before download/view where appropriate

The client should experience one simple upload area regardless of storage provider.

## 12. Email

Client communication remains outside OnboardBox.

However, transactional email will eventually be needed for:

- Invitations
- Password/authentication events
- Onboarding reminders if implemented
- New client requests
- Approval requests
- Connection problems

Do not build an internal chat product.

## Integration Status Model

Recommended generic states:

- not_connected
- connected
- needs_attention
- revoked

Useful metadata:

- external account name
- external account ID
- last successful sync
- token expiry if relevant
- last error
