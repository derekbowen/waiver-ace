import { describe, it, expect } from "vitest";

// Replicate the sha256Hash function used in ApiKeys.tsx
async function sha256Hash(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("sha256Hash", () => {
  it("produces a 64-character hex string", async () => {
    const hash = await sha256Hash("wf_test123");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces consistent results for the same input", async () => {
    const hash1 = await sha256Hash("wf_abc");
    const hash2 = await sha256Hash("wf_abc");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await sha256Hash("wf_key1");
    const hash2 = await sha256Hash("wf_key2");
    expect(hash1).not.toBe(hash2);
  });

  it("is NOT base64 (old insecure method)", async () => {
    const input = "wf_test123";
    const hash = await sha256Hash(input);
    const base64 = btoa(input);
    expect(hash).not.toBe(base64);
  });
});
