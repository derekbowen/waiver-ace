

# Auto Photo Capture Feature

## Summary
Add a camera selfie capture step to the waiver signing flow. Template creators toggle "Require Photo" per template. Signers take a photo before submitting. Photos stored in a private `signer-photos` bucket.

## Database Changes (1 migration)

1. **Add `require_photo` to `templates`** — `boolean NOT NULL DEFAULT false`
2. **Add `photo_storage_key` to `envelopes`** — `text NULL`
3. **Add `photo_storage_key` to `group_signatures`** — `text NULL`
4. **Create `signer-photos` storage bucket** (private)
5. **Storage RLS policies**:
   - INSERT for `anon` and `authenticated` (anyone can upload during signing)
   - SELECT for `authenticated` where the envelope belongs to the user's org
6. **Update `get_envelope_by_token` RPC** to join `templates` and include `require_photo` in the returned JSON
7. **Update `sign_envelope` RPC** to accept `p_photo_storage_key text` and store it

## New Component: `src/components/PhotoCapture.tsx`

- Uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })` for front camera
- States: idle → streaming (live video preview) → captured (still image preview)
- "Take Photo" button captures frame to canvas → JPEG blob (80% quality)
- "Retake" button returns to streaming state
- Graceful error handling: if camera denied/unavailable, shows message; doesn't block signing unless `require_photo` is true
- Props: `onPhoto(blob: Blob | null)`, `required: boolean`
- Consent text: "A photo will be captured for identity verification"

## Signing Pages Integration

**`SigningPage.tsx`** and **`GroupSigningPage.tsx`**:
- Read `require_photo` from the envelope data returned by `get_envelope_by_token` (or from template join in GroupSigningPage)
- Show `<PhotoCapture>` between signature canvas and the agreement checkbox
- On submit: if photo blob exists, upload to `signer-photos/{envelope_id}/{timestamp}.jpg` via Supabase storage SDK, then pass the storage key to the RPC/insert
- Disable submit button when `require_photo` is true and no photo captured

## Template Editor Integration

**`TemplateEditor.tsx`**:
- Add a "Require Photo ID" toggle (Switch) below the existing "Require signing" toggle
- Save `require_photo` to the `templates` table on create

## File Changes Summary

| File | Change |
|---|---|
| `src/components/PhotoCapture.tsx` | **New** — camera capture component |
| `src/pages/SigningPage.tsx` | Add PhotoCapture, upload logic, pass key to RPC |
| `src/pages/GroupSigningPage.tsx` | Add PhotoCapture, upload logic, include key in insert |
| `src/pages/TemplateEditor.tsx` | Add require_photo Switch + save it |
| Migration SQL | Schema changes + bucket + RLS + RPC updates |

