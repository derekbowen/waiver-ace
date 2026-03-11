

## Transactional Email Audit

### Current emails that exist

| Edge Function | Trigger | Recipients | Uses branded template? |
|---|---|---|---|
| `send-signing-email` | Admin sends waiver | Signer | Yes |
| `send-completion-email` | Signer completes waiver | Signer + Org admins | Yes |
| `send-credits-email` (credits_added) | Credit purchase | Org admins | Yes |
| `send-credits-email` (credits_low) | Balance drops below threshold | Org admins | Yes |
| `process-reminders` | Cron — unsigned envelopes >24h | Signer | **No** (raw inline HTML) |
| `marketplace-webhook` (inline) | Marketplace booking creates envelope | Signer | **No** (raw inline HTML) |

### Missing transactional emails

1. **Team invite email** — When an admin invites a team member, the invite is saved to `team_invites` but **no email is sent**. The UI says "Invite sent" but only inserts a DB row. The invitee has no way to know they were invited.

2. **Envelope canceled/voided notification** — When an admin cancels an envelope (`EnvelopeDetail.tsx` line ~109), the signer is never notified that the waiver they received is no longer valid.

3. **Envelope expired notification** — The `process-reminders` cron marks envelopes as expired but sends **no email** to the signer or admin about it.

4. **Welcome / onboarding email** — After signup + org creation (`setup-org` function), no welcome email is sent to the new user with getting-started guidance.

5. **Auto-recharge receipt email** — The `auto-recharge` function charges the card and adds credits, but doesn't trigger `send-credits-email` to confirm the automatic purchase.

### Existing emails that need fixes

6. **Reminder email (`process-reminders`)** — Uses raw inline HTML instead of the branded `buildEmail()` template. Inconsistent with all other emails.

7. **Marketplace webhook signing email** — Also uses raw inline HTML instead of `buildEmail()`. Should be consistent.

### Summary: 5 missing + 2 needing migration to branded templates

```text
MISSING (no email sent at all):
  ├─ Team invite email
  ├─ Envelope canceled notification (to signer)
  ├─ Envelope expired notification (to signer + admin)
  ├─ Welcome/onboarding email (post-signup)
  └─ Auto-recharge confirmation email

BROKEN BRANDING (email sent, but raw HTML):
  ├─ Reminder email (process-reminders)
  └─ Marketplace webhook signing email
```

### Implementation approach

- Create a new `send-team-invite-email` edge function and call it from `TeamMembers.tsx` after successful insert.
- Create a new `send-envelope-notification` edge function handling `canceled` and `expired` event types. Wire canceled into `EnvelopeDetail.tsx`; wire expired into `process-reminders`.
- Create a `send-welcome-email` edge function called from `setup-org`.
- Add a `send-credits-email` call inside `auto-recharge` after successful charge.
- Refactor `process-reminders` and `marketplace-webhook` to use `buildEmail()` for consistent branding.

All new emails will use the existing `buildEmail()` + `sendEmail()` shared utilities for consistent Rental Waivers branding.

