#!/usr/bin/env node
/**
 * Pre-publish parity check: compares the Test and Live database schema
 * (columns, functions, triggers, policies, grants, enums, RLS flags) and
 * seed-state row counts, and reports any mismatch.
 *
 * Usage:
 *   TEST_URL=https://<test>.supabase.co  TEST_TOKEN=<admin access token> \
 *   LIVE_URL=https://<live>.supabase.co  LIVE_TOKEN=<admin access token> \
 *   node scripts/check-schema-parity.mjs
 *
 * Tokens are admin-user access tokens for each environment (grab them from an
 * authenticated session in the app). Exits 1 when a mismatch is found.
 */

// Sections compared strictly (any difference fails the check).
const SCHEMA_SECTIONS = [
  "columns",
  "functions",
  "triggers",
  "policies",
  "rls_enabled",
  "enums",
  "grants",
];

// Seed rows that must exist in both environments (count > 0 on each side).
const REQUIRED_SEED = ["email_send_state"];

async function fetchFingerprint(label, url, token) {
  if (!url || !token) throw new Error(`${label}: missing URL or token`);
  const res = await fetch(`${url.replace(/\/$/, "")}/functions/v1/schema-parity`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${label}: ${res.status} ${body.error ?? "request failed"}`);
  return body.fingerprint;
}

function diffSection(name, a, b) {
  const issues = [];
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const key of [...keys].sort()) {
    const inTest = a?.[key];
    const inLive = b?.[key];
    if (inTest === undefined) issues.push(`${name}: "${key}" exists in Live but not in Test`);
    else if (inLive === undefined) issues.push(`${name}: "${key}" exists in Test but not in Live`);
    else if (JSON.stringify(inTest) !== JSON.stringify(inLive))
      issues.push(`${name}: "${key}" differs between Test and Live`);
  }
  return issues;
}

function diffSeed(test, live) {
  const issues = [];
  for (const key of REQUIRED_SEED) {
    if (!test?.[key]) issues.push(`seed_state: "${key}" has no rows in Test`);
    if (!live?.[key]) issues.push(`seed_state: "${key}" has no rows in Live`);
  }
  return issues;
}

async function main() {
  const [test, live] = await Promise.all([
    fetchFingerprint("Test", process.env.TEST_URL, process.env.TEST_TOKEN),
    fetchFingerprint("Live", process.env.LIVE_URL, process.env.LIVE_TOKEN),
  ]);

  const issues = [
    ...SCHEMA_SECTIONS.flatMap((s) => diffSection(s, test?.[s], live?.[s])),
    ...diffSeed(test?.seed_state, live?.seed_state),
  ];

  if (issues.length === 0) {
    console.log("Schema parity OK — Test and Live match. Safe to publish.");
    console.log("Seed counts (test / live):");
    for (const key of Object.keys(test?.seed_state ?? {})) {
      console.log(`  ${key}: ${test.seed_state[key]} / ${live?.seed_state?.[key] ?? "?"}`);
    }
    return;
  }

  console.error(`Found ${issues.length} mismatch(es) between Test and Live:`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Parity check failed: ${err.message}`);
  process.exitCode = 1;
});
