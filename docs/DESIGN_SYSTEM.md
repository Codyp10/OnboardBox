# OnboardBox Design System

This document defines product feel and interface principles. Specific colors, typography, and components can be added after visual direction is selected.

## Product Feel

OnboardBox should feel:

- Modern
- Professional
- Premium
- Extremely simple
- Calm
- Trustworthy
- Purpose-built for business clients

It is B2B software, not a consumer social application.

## Core UX Principle

Many clients are not marketing experts.

The interface should make the next required action obvious without forcing clients to understand agency jargon or advertising-platform complexity.

## Design Principles

### 1. Clarity Over Density

Prefer:

- A small number of meaningful KPIs
- Clear action states
- Plain-language instructions

Avoid:

- Huge analytics walls
- Excessive charts
- Acronyms without context
- Overloaded screens

### 2. Guided Onboarding

Onboarding should feel progressive and manageable.

Use:

- Visible progress
- Clear completed states
- "Action Required" states
- Save-and-return behavior
- Simple step instructions

### 3. Obvious Status

Status should be easy to scan.

Examples:

- Complete
- Action Required
- Waiting for JMCG
- Connected
- Needs Attention
- Ready to Launch

Do not rely only on color to communicate status.

### 4. Consistency

Use consistent patterns for:

- Forms
- Uploads
- Connection cards
- Buttons
- Empty states
- Errors
- Success messages
- Approval items

### 5. Responsive

The portal should work well on:

- Desktop
- Tablet
- Mobile browsers

Initial implementation does not require a native mobile application.

### 6. Accessibility

Use:

- Adequate contrast
- Keyboard-friendly controls
- Proper labels
- Semantic markup
- Visible focus states
- Descriptive errors

### 7. Restraint

Avoid:

- Excessive animation
- Gratuitous gradients
- Decorative complexity
- Cards nested repeatedly inside cards
- Gamification
- Consumer-social patterns
- AI features that are not part of scope

## Suggested Information Hierarchy

### Client Home

1. Current status / action required
2. Top-level marketing overview
3. Channel summaries
4. Relevant outstanding requests
5. Recent approval items if enabled

### Onboarding

1. Progress
2. Ready to Launch status
3. Blocking items
4. Remaining required items
5. Completed items

### Reporting

1. Time period
2. Overall KPIs
3. Channel cards
4. Limited supporting detail

## Forms

- Use plain-language field labels
- Autosave where practical
- Clearly show saved state
- Avoid asking the same question twice
- Reuse company information across flows

## Error Handling

Errors should explain:

- What happened
- Whether the user's data was saved
- What the user should do next

Bad:
"OAuth error 400."

Better:
"We couldn't finish connecting your Google account. Your other onboarding progress is saved. Try connecting again."

Technical detail may be available to administrators/logs.

## Visual Tokens (V1)

Direction: calm professional B2B — deep teal primary on warm stone neutrals. No purple gradients, no cream-serif terracotta look, no broadsheet density.

### Brand

- Wordmark: **OnboardBox** (Fraunces display for brand moments; portal chrome uses Manrope)
- Product for JMCG clients — brand must remain visible in the authenticated shell

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--ob-teal-900` | `#0B3A44` | Primary actions, nav active |
| `--ob-teal-700` | `#146576` | Links, accents |
| `--ob-teal-100` | `#D7EEF2` | Soft highlights |
| `--ob-stone-50` | `#F7F5F2` | Page atmosphere base |
| `--ob-stone-100` | `#EFECE7` | Panels / secondary surfaces |
| `--ob-stone-300` | `#D2CDC4` | Borders |
| `--ob-ink` | `#1C1916` | Body text |
| `--ob-ink-muted` | `#5C564E` | Supporting text |
| `--ob-success` | `#2F6F4E` | Complete / connected |
| `--ob-warning` | `#A15C12` | Action required / needs attention |
| `--ob-danger` | `#9B2C2C` | Errors / blocking |

Atmosphere: soft stone gradient with a subtle teal wash — not a flat single-color canvas.

### Typography

- Display / brand: `Fraunces`
- UI / body: `Manrope`
- Avoid Inter, Roboto, Arial, and system UI stacks for primary UI text

### Shape & Motion

- Radius: 10px controls, 14px panels (avoid pill clusters)
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48
- Motion: short fade/slide for status changes and progress (2–3 intentional motions); no gamification or glow effects

### Components

- Prefer open layouts over nested cards
- Cards only when they contain a clear interaction (connection, approval, request)
- Status always includes text label, not color alone
