# OnboardBox Product Specification

## 1. Product Definition

OnboardBox is a private client onboarding and marketing reporting portal for JMCG.

It serves clients who are:

- Starting a new relationship with JMCG
- Already working with JMCG

The initial product is not intended to be sold to other agencies.

## 2. Primary Goal

Make it as easy as possible for a new or existing client to give JMCG everything required to perform its work while providing the client with a useful long-term portal after onboarding.

OnboardBox should reduce:

- Scattered onboarding emails
- Repeated requests for access
- Missing information
- Confusing setup instructions
- Manual onboarding follow-up
- Separate links for files, contracts, invoices, and reporting

## 3. User Types

### JMCG Administrator

Administrators can:

- Create client companies
- Add locations
- Select client services
- Generate and edit onboarding steps
- Manually add, remove, and reorder onboarding steps
- Mark steps required or optional
- Mark steps as blocking or non-blocking
- Verify manual-access steps
- Create later client requests
- View onboarding progress
- View all client accounts
- Enable or disable optional features such as approvals
- Manage reporting connections
- Disable client access when appropriate

### Client User

- Belongs to a client company
- Multiple client users may belong to the same company
- Sees the same company data as other authorized users in that company in V1
- Can complete onboarding
- Can save questionnaire progress
- Can upload files
- Can connect authorized accounts
- Can view high-level reporting
- Can complete requests
- Can view billing/document status
- Can participate in approvals when approvals are enabled

Fine-grained client-user permissions may be added later but are not required for V1.

## 4. Company and Location Model

Every client belongs to a Company.

A company may have:

- One location
- Multiple locations

Most current clients have one location, but the architecture must support multiple locations from the beginning.

Location-specific information may eventually include:

- Address
- Phone number
- Service area
- Google Business Profile
- Google LSA account/configuration
- Website or landing page
- Reporting metrics

## 5. Supported Service Categories

- Meta Ads
- Google Ads
- Google Local Services Ads
- SEO
- GEO
- Google Business Profile
- Website
- Podcast Editing

Service selection should help generate a suggested onboarding checklist.

Administrators must still be able to manually modify that checklist.

## 6. Main Portal Navigation

All clients see the same primary navigation in V1:

- Home
- Onboarding
- Reporting
- Approvals
- Files
- Billing
- Account

Sections may display an empty state or disabled state when not relevant.

## 7. Onboarding

### Admin Setup

When creating a client, the administrator can:

1. Enter company information
2. Add one or more locations
3. Add primary client contact
4. Select purchased services
5. Generate suggested onboarding steps
6. Add/remove/edit/reorder steps
7. Configure required and blocking behavior
8. Send a manual invitation

### Step Properties

Each onboarding step should support:

- Title
- Description/instructions
- Step type
- Status
- Required: yes/no
- Blocks launch: yes/no
- Optional dependency
- Assigned service
- Sort order

Suggested step types:

- Questionnaire
- Connection
- File Upload
- Agreement
- Payment
- Instruction
- External Link
- Manual Verification
- Approval
- Custom

### Blocking Behavior

Blocking must be configurable.

The system should not assume every step must be sequential.

A step can be:

- Required but not launch-blocking
- Required and launch-blocking
- Optional
- Dependent on another step

A global/per-client setting may enforce more restrictive progression if desired later.

### Ready to Launch

A company becomes `Ready to Launch` when all incomplete onboarding steps marked `Blocks Launch = Yes` are complete.

This is distinct from percentage completion.

## 8. Onboarding Content

Potential onboarding information includes:

### Company Information

- Company name
- Legal business name
- Website
- Primary contacts
- Phone
- Email
- Address
- Locations
- Service areas

### Business Information

- Primary services
- Priority services
- Most profitable services
- Offers
- Financing
- Marketing budget
- Target service areas
- Excluded service areas
- Differentiators
- Competitors
- Brand restrictions
- Seasonal information

### Brand Assets

Clients may upload:

- Logos
- Brand guides
- Photos
- Videos
- Promotions
- Existing creative
- Relevant documents

V1 uses one simple client-facing upload area.

### Service-Specific Questions

Questions may be added based on purchased service.

Examples:

Meta Ads:
- Services to prioritize
- Existing creative
- Offers
- Budget
- Target area

SEO:
- Priority services
- Priority cities
- Competitors
- Previous SEO work

Podcast Editing:
- Podcast name
- Episode cadence
- Typical length
- Editing preferences
- Intro/outro assets
- Publishing platforms

## 9. Questionnaires

Questionnaires must:

- Autosave
- Allow users to leave and return
- Allow editing after submission by default
- Track last-updated time
- Preserve meaningful change history
- Allow administrators to mark/finalize responses later if needed

## 10. Files

V1 should give clients one simple upload area.

Clients should not need to understand the underlying file-storage provider.

File categories/folders can be added later if necessary.

## 11. Client Requests

Administrators can create requests after or during onboarding.

Example:

"Upload five recent installation photos."

A request should include:

- Title
- Instructions
- Required/optional
- Status
- Created date
- Completion date
- Optional related service

Requests are not chat messages.

## 12. Contracts

DocuSign remains the electronic-signature provider.

OnboardBox should:

- Present the agreement step
- Send/open the client into the appropriate DocuSign flow
- Receive or check signing status
- Mark the step completed after confirmed signature
- Show relevant status/date

OnboardBox should not build its own signature system.

## 13. Billing

Stripe remains the billing/payment provider.

OnboardBox should:

- Present initial invoice/payment steps
- Direct clients into the appropriate Stripe flow
- Receive or check payment status
- Show paid/unpaid status
- Potentially show ongoing billing information

OnboardBox should never store raw card information.

## 14. Account Connections

The portal should eventually support guided connections for:

- Google Ads
- Google Business Profile
- Google Local Services Ads
- Google Analytics
- Google Search Console
- Meta Ads

Use OAuth/official authorization where technically available.

Connection states:

- Not Connected
- Connected
- Needs Attention

OnboardBox should never ask clients to provide Google or Meta passwords.

## 15. Website Access

Website access is not one universal integration.

V1 should ask the client to identify their website platform:

- WordPress
- Webflow
- Shopify
- Squarespace
- Wix
- GoDaddy
- Other
- I don't know

Then show platform-specific instructions and optional instructional video.

Manual website-access steps should support:

- Not Started
- Client Marked Complete
- Waiting for JMCG Verification
- Verified
- Correction Requested

## 16. Instructional Videos

Onboarding and manual-access steps may contain instructional videos.

Videos should be optional reusable content attached to steps/templates.

## 17. Client Dashboard

After onboarding, clients continue using OnboardBox.

V1 reporting is high-level only.

Potential paid-media metrics:

- Ad Spend
- Leads
- Cost Per Lead
- Clicks
- Impressions

Channel-level cards may include:

- Google Ads
- Meta Ads
- Google LSA

SEO/GEO/GBP should use metrics appropriate to those services rather than being forced into the same paid-media schema.

Potential SEO metrics:

- Organic Traffic
- Organic Leads where measurable
- Search Impressions
- Keyword visibility

Potential GBP metrics:

- Calls where available
- Website interactions
- Direction requests where available
- Profile visibility metrics where available

Final reporting metrics should be confirmed during implementation based on API availability and business usefulness.

## 18. Approvals

Approvals should exist but be optional/configurable.

Potential approval items:

- Ad creative
- Ad copy
- Landing pages
- Website designs
- GBP posts
- Blog content
- Podcast assets

V1 should favor a generic approval system rather than separate approval engines for each media type.

Basic actions:

- Approve
- Request Changes

Maintain approval history.

## 19. Communication

OnboardBox does NOT contain client messaging in V1.

Client communication remains through:

- Email
- Phone

Client requests/tasks may exist, but they are not a chat system.

## 20. Client Statuses

Suggested company relationship statuses:

- Invited
- Onboarding
- Active
- Paused
- Former Client

## 21. Explicit Non-Goals for V1

Do not build:

- Full CRM
- Individual lead records
- Call recordings
- Lead pipeline management
- Built-in client chat
- Email marketing system
- Electronic-signature engine
- Payment processor
- Replacement for GHL
- AI performance summaries
- Marketplace for other agencies
