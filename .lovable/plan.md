
## 5 New Features

### 1. Bulk Waiver CSV Export
- Add a "Download CSV" button to the Envelopes page
- Exports filtered envelope data (signer name, email, status, signed date, template name)
- Client-side CSV generation — no backend changes needed

### 2. Find My Waiver (Public Page)
- New public page at `/find-my-waiver`
- Signer enters their email → gets a list of their signed waivers
- Rate-limited edge function to prevent email enumeration
- Shows: waiver name, signed date, status (no sensitive data)
- Link from the footer

### 3. Template Duplication
- Add a "Duplicate" button on the Templates page
- Copies template name (appended with " (Copy)"), description, settings, and current version content
- Creates a new template + template_version row

### 4. Audit Log Viewer (Dashboard Page)
- New `/audit-log` dashboard page
- Shows all `envelope_events` for the org with filtering by event type, date range, and search
- Columns: date, envelope signer, event type, IP, user agent
- Paginated, newest first

### 5. Template Expiration Settings
- Add `default_expiration_days` column to `templates` table (nullable integer)
- When creating an envelope, if the template has a default expiration, auto-set `expires_at`
- Show the setting in the Template Editor
- No new email infrastructure needed (existing `process-reminders` already handles expiring waivers)

### Files Changed
- 1 migration (templates column + find-my-waiver RPC)
- 1 new edge function (`find-my-waiver`)
- 2 new pages (`AuditLog.tsx`, `FindMyWaiver.tsx`)
- Update `Envelopes.tsx` (CSV export button)
- Update `Templates.tsx` (duplicate button)
- Update `TemplateEditor.tsx` (expiration days field)
- Update `NewEnvelope.tsx` (auto-set expiration)
- Update `App.tsx` (routes)
- Update `DashboardLayout.tsx` (nav item)
- Update `Footer.tsx` (Find My Waiver link)
