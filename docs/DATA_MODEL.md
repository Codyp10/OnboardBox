# OnboardBox Conceptual Data Model

This is a conceptual model, not a final database schema.

The final schema should preserve these relationships and multi-tenant boundaries.

## Core Relationship

Company
├── Users
├── Locations
├── Services
├── Onboarding
│   ├── Steps
│   └── Responses
├── Requests
├── Integrations
├── Files
├── Approvals
├── Billing References
└── Reporting Data

## 1. Company

Represents a client organization.

Suggested fields:

- id
- name
- legal_name
- website
- status
- ready_to_launch
- approvals_enabled
- created_at
- updated_at

Suggested statuses:

- invited
- onboarding
- active
- paused
- former

## 2. User

A person with access to OnboardBox.

A client company can have multiple users.

Suggested fields:

- id
- auth_user_id
- first_name
- last_name
- email
- phone
- user_type
- created_at

User types initially:

- admin
- client

Avoid over-building client roles in V1.

## 3. Company Membership

Joins users to companies.

Suggested fields:

- id
- company_id
- user_id
- membership_status
- created_at

This structure supports multiple users per client and future role expansion.

## 4. Location

A physical/service location belonging to a company.

Suggested fields:

- id
- company_id
- name
- address fields
- phone
- website
- service_area_notes
- is_primary
- created_at
- updated_at

Do not assume a company has exactly one location.

## 5. Service

A catalog of JMCG service types.

Examples:

- meta_ads
- google_ads
- google_lsa
- seo
- geo
- google_business_profile
- website
- podcast_editing

## 6. Company Service

Joins a company to the services it receives.

Suggested fields:

- id
- company_id
- service_id
- status
- start_date
- end_date
- notes

## 7. Onboarding Instance

Represents a company's onboarding process.

Suggested fields:

- id
- company_id
- status
- completion_percentage
- ready_to_launch
- started_at
- completed_at
- created_at

## 8. Onboarding Step

Suggested fields:

- id
- onboarding_id
- template_id nullable
- company_id
- service_id nullable
- title
- description
- step_type
- sort_order
- required
- blocks_launch
- depends_on_step_id nullable
- status
- instructional_video_url nullable
- external_url nullable
- completed_at
- completed_by_user_id nullable
- verified_at nullable
- verified_by_admin_id nullable
- created_at
- updated_at

Potential step types:

- questionnaire
- connection
- file_upload
- agreement
- payment
- instruction
- external_link
- manual_verification
- approval
- custom

## 9. Step Template

Reusable onboarding definitions.

Suggested fields:

- id
- name
- default_title
- default_description
- default_step_type
- default_required
- default_blocks_launch
- service_id nullable
- instructional_video_url nullable
- active

Important:

Generating client onboarding should COPY or instantiate template settings so future template changes do not unexpectedly rewrite an active client's onboarding.

## 10. Questionnaire

Suggested fields:

- id
- onboarding_step_id
- name
- version
- status

## 11. Questionnaire Question

Suggested fields:

- id
- questionnaire_id
- question_key
- prompt
- help_text
- question_type
- required
- sort_order
- configuration_json

## 12. Questionnaire Response

Suggested fields:

- id
- questionnaire_id
- question_id
- company_id
- user_id
- value
- submitted_at
- updated_at

Responses should support autosave.

## 13. Questionnaire Response History

Preserves meaningful changes after submission.

Suggested fields:

- id
- response_id
- previous_value
- new_value
- changed_by_user_id
- changed_at

## 14. File Asset

Suggested fields:

- id
- company_id
- onboarding_step_id nullable
- request_id nullable
- uploaded_by_user_id
- storage_provider
- storage_key
- original_filename
- mime_type
- size_bytes
- created_at

Never rely on filenames alone for storage identity.

## 15. Client Request

Suggested fields:

- id
- company_id
- service_id nullable
- title
- instructions
- required
- status
- created_by_admin_id
- completed_by_user_id nullable
- due_date nullable
- created_at
- completed_at

Suggested statuses:

- open
- in_progress
- completed
- cancelled

## 16. Integration Connection

Represents an authorized connection to a third-party provider.

Suggested fields:

- id
- company_id
- location_id nullable
- provider
- connection_status
- external_account_id
- external_account_name
- scopes
- token_reference / encrypted token storage
- token_expires_at nullable
- last_successful_sync_at nullable
- last_error_code nullable
- last_error_message nullable
- created_at
- updated_at

Connection statuses:

- not_connected
- connected
- needs_attention
- revoked

Do not expose sensitive tokens to browser clients.

## 17. Approval

Suggested fields:

- id
- company_id
- service_id nullable
- title
- description
- item_type
- status
- created_by_admin_id
- created_at
- updated_at

Statuses:

- pending
- approved
- changes_requested
- cancelled

## 18. Approval Action / History

Suggested fields:

- id
- approval_id
- user_id
- action
- comment nullable
- created_at

## 19. Billing Reference

OnboardBox should store references/status, not payment credentials.

Suggested fields:

- id
- company_id
- provider
- provider_customer_id
- provider_invoice_id nullable
- invoice_type
- amount
- currency
- status
- due_date nullable
- paid_at nullable
- created_at

## 20. Agreement Reference

Suggested fields:

- id
- company_id
- provider
- provider_envelope_id
- agreement_name
- status
- sent_at
- signed_at nullable
- created_at

## 21. Reporting Connection / Metric

Exact reporting schema should be designed after integration capabilities are confirmed.

At minimum, metrics must be scoped by:

- company
- optional location
- provider/channel
- date or date range
- metric name
- metric value

Do not design reporting in a way that assumes every channel has the same metrics.

## Tenant Isolation Requirement

Every record that contains client data must be traceable to a company.

Server-side authorization must verify company membership before returning or mutating client data.

Never trust a company ID supplied by the browser without validating the authenticated user's membership/permissions.
