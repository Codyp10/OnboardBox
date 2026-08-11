# OnboardBox User Flows

## 1. Admin Creates Client

Admin
→ Create Client
→ Enter company information
→ Add primary contact
→ Add location(s)
→ Select purchased services
→ Generate suggested onboarding steps
→ Review/edit onboarding steps
→ Configure required/blocking behavior
→ Send invitation

Invitations are manual in V1.

## 2. Client Accepts Invitation

Invitation email
→ Open secure invitation link
→ Create account / authenticate
→ Join assigned company
→ Welcome screen
→ Begin onboarding

Multiple users may belong to the same company.

## 3. Client Onboarding

Recommended default flow:

Welcome
→ Company Information
→ Agreement
→ Initial Payment
→ Business Questionnaire
→ Upload Files
→ Account Connections
→ Website Access if required
→ Final Review
→ Ready to Launch
→ Main Client Portal

The UI should feel guided, but steps do not have to be technically sequential unless configured.

## 4. Welcome

Purpose:

- Explain what OnboardBox is
- Tell the client that progress saves automatically
- Make the next action obvious
- Avoid overwhelming the user

Example:

"Welcome to OnboardBox. We'll walk you through everything JMCG needs to get started."

## 5. Company Information

Collect reusable company data once.

Fields may include:

- Company name
- Legal business name
- Website
- Primary contact
- Email
- Phone
- Address
- Number of locations

If multiple locations exist, collect appropriate information for each location.

## 6. Agreement Flow

Agreement step
→ Client selects Review & Sign
→ DocuSign signing experience
→ DocuSign confirms completion
→ OnboardBox marks Agreement Complete

Failure state:

Agreement pending or signing incomplete
→ Keep step open
→ Allow retry/return

## 7. Payment Flow

Payment step
→ Show amount/status
→ Client selects Pay Invoice
→ Stripe-hosted or appropriate payment experience
→ Stripe confirms successful payment
→ OnboardBox marks step complete

Do not treat browser return alone as proof of payment. Confirm status server-side.

## 8. Questionnaire Flow

Questionnaire
→ Client answers questions
→ Answers autosave
→ Client can leave
→ Client returns later
→ Continue from saved state
→ Submit

After submission:

- Responses remain editable by default
- Last updated timestamp changes
- Meaningful edits preserve history

## 9. File Upload Flow

Upload Files
→ Client drags/selects files
→ Upload progress
→ File successfully stored
→ Show uploaded files
→ Allow more files

V1 uses one client-facing upload area.

## 10. Connection Flow

Connections page
→ Show only relevant/required services
→ Client selects Connect
→ Provider authorization flow
→ User approves requested access
→ Provider redirects to OnboardBox
→ Server validates authorization
→ Client selects correct account/property if needed
→ Save authorized connection
→ Show Connected state

Connection states:

- Not Connected
- Connected
- Needs Attention

Failure states must be recoverable.

Never collect the client's provider password.

## 11. Website Access Flow

Website Access
→ Ask website platform
→ Show platform-specific instructions
→ Show optional instructional video
→ Client completes external access steps
→ Client selects "I've Added JMCG"
→ Status becomes Waiting for JMCG Verification

Admin
→ Tests access

If correct:
→ Verify
→ Step Complete

If incorrect:
→ Request Correction
→ Client sees action required

## 12. Final Review

Show:

- Completed items
- Remaining required items
- Remaining launch-blocking items
- Optional incomplete items

If launch-blocking items remain:

Ready to Launch = No

If all blocking items are complete:

Ready to Launch = Yes

Notify/show admin that onboarding is ready for launch.

## 13. Post-Onboarding Client Experience

Client logs in
→ Home dashboard

Primary navigation:

- Home
- Onboarding
- Reporting
- Approvals
- Files
- Billing
- Account

Onboarding remains accessible for historical/reference purposes.

## 14. Client Request Flow

Admin
→ Open company
→ Create Request
→ Enter title/instructions
→ Mark required/optional
→ Send

Client
→ Sees Action Required
→ Opens request
→ Completes requested action
→ Request status updates

Examples:

- Upload additional photos
- Confirm a new offer
- Reconnect an expired account
- Provide updated service areas

This is task/request functionality, not messaging.

## 15. Approval Flow

If approvals are enabled:

Admin
→ Create approval item
→ Attach/show item
→ Send for approval

Client
→ View item

Actions:

- Approve
- Request Changes

Store:

- Current status
- Timestamp
- User who acted
- Approval history

If approvals are disabled for a client, the client should not be required to use the workflow.

## 16. Admin Overview

Admin dashboard
→ View client list

Useful summary fields:

- Company name
- Status
- Onboarding percentage
- Ready to Launch yes/no
- Missing/blocking items

Open client
→ View:

- Company
- Locations
- Users
- Services
- Onboarding
- Requests
- Integrations
- Files
- Approvals
- Billing status
- Reporting status

## 17. Multi-User Company Flow

Company
→ User A
→ User B
→ User C

All authorized users see the same company-level data in V1.

Future role restrictions may be added later.

## 18. Multi-Location Flow

Company
→ Location 1
→ Location 2

Most portal actions remain company-level.

Only data that truly belongs to a specific location should require a location assignment.
