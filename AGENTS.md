# Architecture rules

- Server-side purchase grants use the shared purchase-credit helper and the uniquely named add_credits_internal routine; overloaded add_credits cannot be resolved by the JSON RPC API.

- Golf cart agreements use the existing template body and signature_data JSON, with a shared driver form; no new application tables are needed.
- License images use a dedicated private bucket with no client access policies; a token-validated function handles uploads and checks same-organization admin membership and signed attachment references before issuing 60-second download links. License images never enter PDFs or completion emails.
- Each additional golf cart driver signs separately through existing signing workflows; staff verifies licenses and authorization, because a signature is not identity verification.
- Waiver acknowledgments are independent template presets identifying the original waiver by title, revision and reference; no automatic two-document sequencing or linking is implied.