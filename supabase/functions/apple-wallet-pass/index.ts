// Generates a real, signed Apple Wallet (.pkpass) file for a check-in pass.
// Public: GET ?code=WVR-1234-AB  (pass codes are unguessable and already public via /pass/:code)
import forge from "npm:node-forge@1.3.1";
import { zipSync, strToU8 } from "npm:fflate@0.8.2";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://www.rentalwaivers.com";
const b64 = (name: string) => atob(Deno.env.get(name) ?? "");

let iconCache: Uint8Array | null = null;
async function getIcon(): Promise<Uint8Array> {
  if (iconCache) return iconCache;
  const res = await fetch(`${SITE}/app-icon-180.png`);
  if (!res.ok) throw new Error("icon fetch failed");
  iconCache = new Uint8Array(await res.arrayBuffer());
  return iconCache;
}

function sha1Hex(data: Uint8Array): string {
  const md = forge.md.sha1.create();
  let s = "";
  for (let i = 0; i < data.length; i += 8192) {
    s += String.fromCharCode(...data.subarray(i, i + 8192));
  }
  md.update(s);
  return md.digest().toHex();
}

function sign(manifest: Uint8Array): Uint8Array {
  const cert = forge.pki.certificateFromPem(b64("APPLE_PASS_CERT_B64"));
  const wwdr = forge.pki.certificateFromPem(b64("APPLE_WWDR_CERT_B64"));
  const key = forge.pki.privateKeyFromPem(b64("APPLE_PASS_KEY_B64"));
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(new TextDecoder().decode(manifest), "utf8");
  p7.addCertificate(cert);
  p7.addCertificate(wwdr);
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() as any },
    ],
  });
  p7.sign({ detached: true });
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  const out = new Uint8Array(der.length);
  for (let i = 0; i < der.length; i++) out[i] = der.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const code = (new URL(req.url).searchParams.get("code") ?? "").trim().toUpperCase();
    if (!/^WVR-\d{4}-[A-Z]{2}$/.test(code)) {
      return new Response("Invalid pass code", { status: 400, headers: corsHeaders });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.rpc("get_check_in_pass", { p_code: code });
    const p = data as any;
    if (error || !p || p.error) {
      return new Response("Pass not found", { status: 404, headers: corsHeaders });
    }

    const covered: string[] = (Array.isArray(p.covered_names) ? p.covered_names : []).filter(Boolean);
    const validUntil = p.valid_until ? new Date(p.valid_until) : null;
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const passJson: Record<string, unknown> = {
      formatVersion: 1,
      passTypeIdentifier: Deno.env.get("APPLE_PASS_TYPE_ID"),
      teamIdentifier: Deno.env.get("APPLE_TEAM_ID"),
      serialNumber: p.pass_code,
      organizationName: p.org_name || "RentalWaivers",
      description: `Check-in pass for ${p.activity_name || "your activity"}`,
      logoText: p.org_name || "RentalWaivers",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(17, 24, 39)",
      labelColor: "rgb(156, 163, 175)",
      generic: {
        primaryFields: [{ key: "activity", label: "ACTIVITY", value: p.activity_name || "Waiver on file" }],
        secondaryFields: [
          { key: "covered", label: `COVERED · ${covered.length || 1}`, value: covered.join(", ") || p.guest_name || "Guest" },
        ],
        auxiliaryFields: [
          ...(validUntil ? [{ key: "valid", label: "VALID UNTIL", value: fmt(validUntil) }] : []),
          { key: "code", label: "PASS CODE", value: p.pass_code },
        ],
        backFields: [
          { key: "info", label: "How to use", value: "Show this pass at check-in. Staff scan the code to confirm your signed waiver." },
          { key: "link", label: "View pass online", value: `${SITE}/pass/${p.pass_code}` },
        ],
      },
      barcodes: [{
        format: "PKBarcodeFormatQR",
        message: `${SITE}/check-in?code=${p.pass_code}`,
        messageEncoding: "iso-8859-1",
        altText: p.pass_code,
      }],
    };
    if (validUntil) passJson.expirationDate = validUntil.toISOString();

    const icon = await getIcon();
    const files: Record<string, Uint8Array> = {
      "pass.json": strToU8(JSON.stringify(passJson)),
      "icon.png": icon,
      "icon@2x.png": icon,
      "logo.png": icon,
      "logo@2x.png": icon,
    };
    const manifest: Record<string, string> = {};
    for (const [n, d] of Object.entries(files)) manifest[n] = sha1Hex(d);
    const manifestBytes = strToU8(JSON.stringify(manifest));
    files["manifest.json"] = manifestBytes;
    files["signature"] = sign(manifestBytes);

    const zip = zipSync(files, { level: 6 });
    return new Response(zip, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${p.pass_code}.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("apple-wallet-pass error", e);
    return new Response("Could not create pass", { status: 500, headers: corsHeaders });
  }
});
