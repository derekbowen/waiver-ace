

## Document Storage with Smart Pricing

### Pricing Recommendation

Given your existing pay-per-waiver credits model, here's what makes sense:

**Hybrid approach: Free tier + credit-based upgrades**

- Every org gets **100MB free storage** (covers most small hosts)
- Completed waiver PDFs are stored automatically (no extra charge -- already paid via waiver credit)
- Custom file uploads cost **1 credit per file** (up to 25MB each)
- Orgs can see their storage usage on the Settings/Dashboard page

This keeps it simple, aligned with your existing credit system, and avoids adding a separate subscription tier.

### What Gets Built

1. **Database: `documents` table + storage tracking**
   - `documents` table: id, org_id, user_id, filename, storage_key, file_size, content_type, source (waiver_pdf | user_upload), envelope_id (nullable), created_at
   - Add `storage_used_bytes` column to `wallets` table for fast quota checks
   - RLS: org members can SELECT, admins can INSERT/DELETE

2. **Storage bucket: `org-documents`**
   - Private bucket, paths scoped by org_id
   - RLS policies restricting access to org members

3. **Edge function: `upload-document`**
   - Validates file size (25MB max), content type whitelist
   - Checks storage quota (100MB free)
   - Deducts 1 credit for user uploads (waiver PDFs are free)
   - Returns signed upload URL

4. **Frontend: Document Manager UI**
   - New "Documents" section in the dashboard sidebar
   - Upload button, file list with download/delete, storage usage bar
   - Filter by source (waivers vs uploads)
   - Credit cost warning before upload

5. **Auto-link waiver PDFs**
   - After waiver completion, the existing `generate-pdf` function inserts a row into `documents` with source = `waiver_pdf` (no credit charge)

### Technical Details

- Files stored in `org-documents` bucket under path `{org_id}/{document_id}/{filename}`
- Download via time-limited signed URLs (matching existing waiver PDF pattern)
- Content type whitelist: PDF, DOCX, XLSX, JPG, PNG, WEBP
- Storage quota enforced server-side in the edge function
- `storage_used_bytes` updated via trigger on documents INSERT/DELETE

### Files Changed

- 1 migration (documents table, wallets column, storage bucket, RLS, trigger)
- 1 new edge function (`upload-document/index.ts`)
- 1 new page (`src/pages/Documents.tsx`)
- Update `src/App.tsx` (add route)
- Update `src/components/DashboardLayout.tsx` (add nav item)
- Update `generate-pdf` edge function (auto-insert document row)

