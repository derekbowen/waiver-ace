# Roadmap

## Purchase credit recovery
- [x] Fix ambiguous credit grants in payment processing, purchase recovery, and automatic recharge.
- [x] Four purchase-credit tests passed; deployed fixes, replayed the customer's already-credited payment without duplicates, and checked signed-in Verify Purchase. No new paid purchase or automatic charge was made.

## Driver license capture
- [x] Add optional consent-based license-image uploads to individual and group golf cart signing; clear license data between group guests.
- [x] Store images privately and allow only same-organization admins to retrieve signed attachments; no license images in PDFs or emails.
- [x] Verified mobile upload, signed attachment, admin retrieval, PDF/document workflow, and denied public downloads/signed-out retrieval/late uploads; seven validation tests passed.
- [x] Include license images in account-deletion cleanup. Group signing and account deletion not exercised end-to-end.

## Golf cart template
- [x] Add configurable golf cart agreement to the existing template library.
- [x] Capture each driver's verification and safety acknowledgment using existing signatures.
- [x] Include driver details in existing PDFs; verified template creation, QR link access, mobile signing, PDF download, and account document retrieval.
- [x] Optional license copies remain staff-only through existing private document upload; no public license-image collection added.
- [x] Archived test-only templates and QR signs, preserving the signed test document. Physical camera scanning, group signing, and optional license upload were not exercised.

## Done
- Published email fix (htmlToText + retries) → www.rentalwaivers.com
- Added missing completion_email_* columns to organizations in Test (parity fix)
- E2E test: created + signed test waiver, completion email with kayak lock code (1987) sent to signer and host — both status "sent" in email_send_log
- Answered lease-agreement keyword question: not implementing (wrong audience)

## Open
- [x] QR Code Kiosk Signing System: unique per-waiver QR codes (5 credits one-time), printable sign, guest email capture on kiosk signing, /qr-code-waivers explainer page
- Publish so the kayak customer can print his QR signs
- Confirm arrival in a real inbox on the live site: user should send one real waiver from www.rentalwaivers.com (Live backend is read-only from my tools) and check their inbox.
- [x] Drafted copy-paste reply for customer (QR code, minors section, waiver copies)
