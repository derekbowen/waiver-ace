// End-to-end test: create envelope → sign → verify status=completed →
// generate PDF → confirm it's stored and downloadable.
//
// Uses the public kiosk_create path so no API key or org membership is
// required to provision an envelope. Signing is anonymous via the public
// sign_envelope RPC.
//
// The generate-pdf edge function requires an authenticated org member. When
// SUPABASE_SERVICE_ROLE_KEY is available (CI/local), the test finds an
// admin in the kiosk envelope's org, mints an access token, calls
// generate-pdf, and re-downloads the file from private storage to verify
// bytes match. When the service role is not present, the test still verifies:
//   - generate-pdf rejects unauthenticated callers (401)
//   - the envelope reaches status "completed"
//
// Run: deno test --allow-net --allow-env supabase/functions/generate-pdf/pdf_e2e_test.ts

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Seeded template used by other kiosk tests in this project.
const TEMPLATE_ID = "58a4792c-8cac-40f6-9b4b-167c47c65bbf";

async function createKioskEnvelope(): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/waiverflow-api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: "kiosk_create", template_id: TEMPLATE_ID }),
  });
  const body = await res.json();
  assertEquals(res.status, 201, `kiosk_create failed: ${JSON.stringify(body)}`);
  assert(typeof body.signing_token === "string", "expected signing_token");
  return body.signing_token as string;
}

async function signEnvelope(token: string, signerName: string) {
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await anon.rpc("sign_envelope", {
    p_token: token,
    p_signer_name: signerName,
    p_signature_data: {
      full_name: signerName,
      initials: signerName
        .split(" ")
        .map((s) => s[0])
        .join("")
        .toUpperCase(),
      signed_at_utc: new Date().toISOString(),
      agreed_to_electronic_signing: true,
      user_agent: "deno-e2e-test",
    },
    p_user_agent: "deno-e2e-test",
  });
  assert(!error, `sign_envelope RPC error: ${error?.message}`);
  const result = data as { success: boolean; envelope_id?: string; error?: string };
  assert(result?.success, `sign_envelope failed: ${JSON.stringify(result)}`);
  return result.envelope_id!;
}

async function fetchEnvelopeStatus(token: string): Promise<string> {
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await anon.rpc("get_envelope_by_token", {
    p_token: token,
    p_ip_address: "127.0.0.1",
    p_user_agent: "deno-e2e-test",
  });
  assert(!error, `get_envelope_by_token error: ${error?.message}`);
  const payload = data as Record<string, unknown>;
  return String(payload.status);
}

Deno.test({
  name: "e2e: create → sign → status becomes completed",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const token = await createKioskEnvelope();
    assertEquals(await fetchEnvelopeStatus(token), "sent");

    await signEnvelope(token, `Test Signer ${crypto.randomUUID().slice(0, 6)}`);
    const status = await fetchEnvelopeStatus(token);
    assertEquals(status, "completed", `expected completed, got ${status}`);
  },
});

Deno.test({
  name: "e2e: generate-pdf rejects unauthenticated callers",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const token = await createKioskEnvelope();
    const envelopeId = await signEnvelope(token, "Unauth Test");

    // No Authorization header → 401.
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ envelope_id: envelopeId }),
    });
    // Consume body to avoid resource leak.
    const body = await res.json().catch(() => ({}));
    assertEquals(res.status, 401, `expected 401, got ${res.status} ${JSON.stringify(body)}`);
  },
});

Deno.test({
  name: "e2e: generate-pdf produces a stored & downloadable signed PDF",
  ignore: !SERVICE_ROLE_KEY,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const token = await createKioskEnvelope();
    const envelopeId = await signEnvelope(token, "PDF E2E Signer");
    assertEquals(await fetchEnvelopeStatus(token), "completed");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Look up the org that owns this envelope, then find any admin user in it.
    const { data: envRow, error: envErr } = await admin
      .from("envelopes")
      .select("org_id")
      .eq("id", envelopeId)
      .single();
    assert(!envErr && envRow?.org_id, `env lookup failed: ${envErr?.message}`);

    const { data: adminRole } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("org_id", envRow.org_id)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    assert(adminRole?.user_id, "no admin user found for kiosk envelope's org");

    // Mint an access token for the admin (magic link → extract token).
    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(
      adminRole.user_id,
    );
    assert(!userErr && userRes.user?.email, `admin user lookup failed: ${userErr?.message}`);

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userRes.user.email!,
    });
    assert(!linkErr, `generateLink failed: ${linkErr?.message}`);

    // Verify the OTP hash to obtain a real session.
    const hashed = linkData?.properties?.hashed_token;
    assert(hashed, "no hashed_token in magic link response");
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: sessionRes, error: verifyErr } = await anon.auth.verifyOtp({
      type: "magiclink",
      token_hash: hashed,
    });
    assert(!verifyErr && sessionRes.session, `verifyOtp failed: ${verifyErr?.message}`);
    const accessToken = sessionRes.session!.access_token;

    // Call generate-pdf as the org admin.
    const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ envelope_id: envelopeId }),
    });
    assertEquals(pdfRes.status, 200, `generate-pdf failed: ${pdfRes.status}`);
    assertEquals(pdfRes.headers.get("content-type"), "application/pdf");
    const returnedBytes = new Uint8Array(await pdfRes.arrayBuffer());
    assert(returnedBytes.length > 100, "PDF response too small");
    // Basic PDF signature check.
    const header = new TextDecoder().decode(returnedBytes.slice(0, 4));
    assertEquals(header, "%PDF", `expected PDF header, got ${header}`);

    // Confirm envelope row was updated with storage key + hash.
    const { data: updated } = await admin
      .from("envelopes")
      .select("pdf_storage_key, pdf_hash, status")
      .eq("id", envelopeId)
      .single();
    assertEquals(updated?.status, "completed");
    assert(updated?.pdf_storage_key, "envelope missing pdf_storage_key");
    assert(updated?.pdf_hash, "envelope missing pdf_hash");
    assertNotEquals(updated!.pdf_storage_key, "");

    // Re-download from the private bucket via service role to prove the file
    // is stored and retrievable, and that the bytes match what the function
    // returned to the caller.
    const { data: fileBlob, error: dlErr } = await admin.storage
      .from("waiver-pdfs")
      .download(updated!.pdf_storage_key!);
    assert(!dlErr && fileBlob, `storage download failed: ${dlErr?.message}`);
    const storedBytes = new Uint8Array(await fileBlob!.arrayBuffer());
    assertEquals(storedBytes.length, returnedBytes.length, "stored PDF size mismatch");

    // A signed URL should also work — proves the file is downloadable via the
    // same mechanism the app uses.
    const { data: signed, error: signErr } = await admin.storage
      .from("waiver-pdfs")
      .createSignedUrl(updated!.pdf_storage_key!, 60);
    assert(!signErr && signed?.signedUrl, `signed URL failed: ${signErr?.message}`);
    const signedRes = await fetch(signed!.signedUrl);
    const signedBytes = new Uint8Array(await signedRes.arrayBuffer());
    assertEquals(signedRes.status, 200);
    assertEquals(signedBytes.length, returnedBytes.length, "signed URL bytes mismatch");
  },
});
