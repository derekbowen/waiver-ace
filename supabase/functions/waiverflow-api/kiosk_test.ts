// End-to-end test for kiosk mode:
// 1. Anonymously create a kiosk envelope via waiverflow-api
// 2. Load the envelope via get_envelope_by_token while signed in as a different
//    user — verify NO email_mismatch (this was the bug we fixed).
//
// Run with: deno test --allow-net --allow-env supabase/functions/waiverflow-api/kiosk_test.ts

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
// Any active template will do — this one is seeded in the project.
const TEMPLATE_ID = "58a4792c-8cac-40f6-9b4b-167c47c65bbf";

Deno.test("kiosk envelope opens for a signed-in viewer with a different email", async () => {
  // ---- 1. Create the kiosk envelope (no auth header) ----
  const createRes = await fetch(`${SUPABASE_URL}/functions/v1/waiverflow-api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Anon JWT is required by the gateway, but the function itself treats
      // kiosk_* as unauthenticated.
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: "kiosk_create", template_id: TEMPLATE_ID }),
  });

  const createBody = await createRes.json();
  assertEquals(createRes.status, 201, `kiosk_create failed: ${JSON.stringify(createBody)}`);
  assert(typeof createBody.signing_token === "string", "expected signing_token in response");

  const signingToken: string = createBody.signing_token;

  // ---- 2. Sign up a throwaway user so we have a JWT with an email claim ----
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const testEmail = `kiosk-test-${crypto.randomUUID()}@example.com`;
  const { data: signUp, error: signUpErr } = await anonClient.auth.signUp({
    email: testEmail,
    password: `Pw_${crypto.randomUUID()}`,
  });
  assert(!signUpErr, `signUp failed: ${signUpErr?.message}`);
  assert(signUp.session, "expected session after signUp (auto-confirm should be on for tests)");

  // Sanity: the signed-in viewer's email is NOT the kiosk placeholder.
  assert(testEmail !== "kiosk@placeholder.local");

  // ---- 3. Load the envelope as the signed-in viewer ----
  const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${signUp.session.access_token}` },
    },
  });

  const { data: rpcData, error: rpcErr } = await authedClient.rpc(
    "get_envelope_by_token",
    {
      p_token: signingToken,
      p_ip_address: "127.0.0.1",
      p_user_agent: "deno-test",
    },
  );

  assert(!rpcErr, `RPC failed: ${rpcErr?.message}`);
  assert(rpcData, "expected envelope payload");

  // The critical assertion: kiosk envelopes must NOT trigger email_mismatch
  // even when the viewer's JWT email differs from the placeholder.
  const payload = rpcData as Record<string, unknown>;
  assertEquals(
    payload.error,
    undefined,
    `unexpected error from RPC: ${JSON.stringify(payload)}`,
  );
  assertEquals(payload.signing_token, signingToken);
  assert(payload.template_content, "expected template_content to be populated");

  // Cleanup: sign out to release the session.
  await authedClient.auth.signOut();
});
