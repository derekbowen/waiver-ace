-- Group waivers: one shareable link, multiple individual signers
-- The "group_token" on the envelope lets anyone with the link sign individually

-- Add group mode fields to envelopes
ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS is_group_waiver boolean NOT NULL DEFAULT false;
ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS group_token uuid DEFAULT gen_random_uuid();
ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS group_label text; -- e.g. "Smith Family Pool Party"

-- Index for group token lookups from signing page
CREATE INDEX IF NOT EXISTS idx_envelopes_group_token ON envelopes (group_token) WHERE group_token IS NOT NULL;

-- Individual signatures collected through the group link
CREATE TABLE IF NOT EXISTS group_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES envelopes(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text, -- optional: collected but not required upfront
  initials text,
  signature_image text, -- base64 PNG data URL
  signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  content_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_signatures_envelope_id ON group_signatures (envelope_id);

-- RLS for group_signatures
ALTER TABLE group_signatures ENABLE ROW LEVEL SECURITY;

-- Org members can view signatures for their envelopes
CREATE POLICY "Org members can view group signatures"
  ON group_signatures FOR SELECT
  USING (
    envelope_id IN (
      SELECT id FROM envelopes WHERE org_id IN (
        SELECT org_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Anonymous signers can insert their own signature (via group signing page)
CREATE POLICY "Anon can insert group signatures"
  ON group_signatures FOR INSERT
  WITH CHECK (
    envelope_id IN (
      SELECT id FROM envelopes WHERE group_token IS NOT NULL AND is_group_waiver = true
    )
  );

-- Anonymous can read their own (to show "already signed" list)
CREATE POLICY "Anon can view group signatures for group envelopes"
  ON group_signatures FOR SELECT
  USING (
    envelope_id IN (
      SELECT id FROM envelopes WHERE group_token IS NOT NULL AND is_group_waiver = true
    )
  );

-- Allow anonymous to read envelopes by group_token
CREATE POLICY "Signers can view envelope by group token"
  ON envelopes FOR SELECT
  USING (group_token IS NOT NULL AND is_group_waiver = true);
