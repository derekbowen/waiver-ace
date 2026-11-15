# Roadmap

## Golf cart template
- [ ] Add configurable golf cart agreement to the existing template library.
- [ ] Capture each driver's verification and safety acknowledgment using existing signatures.
- [ ] Include driver details in existing PDFs; verify selection, QR access, signing, and retrieval.
- [ ] Optional license copies: use the existing authenticated document upload, not public photo uploads.

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
