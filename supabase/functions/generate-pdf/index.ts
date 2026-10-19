import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { renderWaiverTemplate } from "../_shared/renderWaiver.ts";

// Minimal multi-page PDF generator. Text is encoded as WinAnsi (Latin-1) so
// accented names render correctly, and all offsets are byte-accurate.
function buildPdf(lines: string[]): Uint8Array {
  const toLatin1 = (s: string): number[] => {
    const out: number[] = [];
    for (const ch of s.normalize("NFC")) {
      const c = ch.codePointAt(0)!;
      if (c === 0x2018 || c === 0x2019) out.push(0x27);
      else if (c === 0x201c || c === 0x201d) out.push(0x22);
      else if (c === 0x2013 || c === 0x2014) out.push(0x2d);
      else if (c === 0x2022) out.push(0x95);
      else if (c === 0x2026) { out.push(0x2e, 0x2e, 0x2e); }
      else out.push(c <= 0xff ? c : 0x3f);
    }
    return out;
  };
  const esc = (bytes: number[]) => {
    const out: number[] = [];
    for (const b of bytes) {
      if (b === 0x5c || b === 0x28 || b === 0x29) out.push(0x5c);
      out.push(b);
    }
    return out;
  };
  const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));

  // Paginate: 50 lines per page.
  const perPage = 50;
  const pages: string[][] = [];
  for (let i = 0; i < Math.max(lines.length, 1); i += perPage) pages.push(lines.slice(i, i + perPage));

  const streams: number[][] = pages.map((pageLines, pi) => {
    const b: number[] = [...ascii("BT\n/F1 10 Tf\n")];
    let y = 750;
    for (const line of pageLines) {
      b.push(...ascii(`1 0 0 1 50 ${y} Tm\n(`), ...esc(toLatin1(line)), ...ascii(") Tj\n"));
      y -= 14;
    }
    b.push(...ascii(`1 0 0 1 270 30 Tm\n(Page ${pi + 1} of ${pages.length}) Tj\nET`));
    return b;
  });

  // Object numbering: 1 catalog, 2 pages, 3 font, then (page, content) pairs.
  const objs: number[][] = [];
  const kids = pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ");
  objs.push(ascii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj"));
  objs.push(ascii(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj`));
  objs.push(ascii("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj"));
  streams.forEach((st, i) => {
    const pageNo = 4 + i * 2;
    objs.push(ascii(`${pageNo} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${pageNo + 1} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj`));
    objs.push([...ascii(`${pageNo + 1} 0 obj\n<< /Length ${st.length} >>\nstream\n`), ...st, ...ascii("\nendstream\nendobj")]);
  });

  const body: number[] = [...ascii("%PDF-1.4\n")];
  const offsets: number[] = [];
  for (const o of objs) { offsets.push(body.length); body.push(...o, 0x0a); }
  const xrefStart = body.length;
  let tail = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) tail += `${String(off).padStart(10, "0")} 00000 n \n`;
  tail += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  body.push(...ascii(tail));
  return new Uint8Array(body);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get caller's org
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", authData.user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { envelope_id } = await req.json();
    if (!envelope_id) {
      return new Response(JSON.stringify({ error: "envelope_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get envelope with template version
    const { data: envelope, error: envErr } = await supabase
      .from("envelopes")
      .select("*, template_versions(content, version, template_id)")
      .eq("id", envelope_id)
      .single();

    if (envErr || !envelope) {
      return new Response(JSON.stringify({ error: "Envelope not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify org ownership
    if (envelope.org_id !== profile.org_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (envelope.status !== "completed" && envelope.status !== "signed") {
      return new Response(JSON.stringify({ error: "Envelope has not been signed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get template name
    const { data: template } = await supabase
      .from("templates")
      .select("name")
      .eq("id", (envelope.template_versions as any)?.template_id)
      .single();

    // Get org name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", envelope.org_id)
      .single();

    // Build the waiver text
    const content = (envelope.template_versions as any)?.content?.body || "";
    const payload = (envelope.payload as Record<string, any>) || {};
    const sigPre = (envelope.signature_data as Record<string, any>) || {};
    const effectiveDate = payload.rental_date
      ? new Date(payload.rental_date + "T00:00:00").toLocaleDateString("en-US")
      : envelope.signed_at ? new Date(envelope.signed_at).toLocaleDateString("en-US") : "";
    const rendered = renderWaiverTemplate(content, payload, {
      customer_name: sigPre.full_name || envelope.signer_name || "",
      date: effectiveDate,
      rental_date: effectiveDate,
      minor_names: sigPre.minor_names || "None",
    });

    const sigData = envelope.signature_data as Record<string, any> || {};

    const lines: string[] = [
      `Organization: ${org?.name || ""}`,
      `Document: ${template?.name || "Waiver Agreement"}`,
      `Envelope ID: ${envelope.id}`,
      "",
      "---",
      "",
    ];

    // Split content into lines (wrap at ~80 chars)
    for (const paragraph of rendered.split("\n")) {
      if (paragraph.length <= 80) {
        lines.push(paragraph);
      } else {
        const words = paragraph.split(" ");
        let current = "";
        for (const word of words) {
          if ((current + " " + word).length > 80) {
            lines.push(current);
            current = word;
          } else {
            current = current ? current + " " + word : word;
          }
        }
        if (current) lines.push(current);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("SIGNATURE");
    lines.push(`Full Name: ${sigData.full_name || envelope.signer_name || ""}`);
    lines.push(`Initials: ${sigData.initials || ""}`);
    lines.push(`Signed at: ${sigData.signed_at_utc || envelope.signed_at || ""}`);
    lines.push(`Email: ${envelope.signer_email}`);
    lines.push(`IP Address: ${envelope.ip_address || "N/A"}`);
    lines.push(`User Agent: ${(sigData.user_agent || envelope.user_agent || "N/A").slice(0, 80)}`);
    lines.push(`Electronic Consent: ${sigData.agreed_to_electronic_signing ? "Yes" : "N/A"}`);
    const pdfMinors = Array.isArray(sigData.minors) ? sigData.minors : [];
    if (pdfMinors.length > 0) {
      lines.push("");
      lines.push("MINORS / DEPENDENTS COVERED");
      for (const m of pdfMinors) {
        lines.push(`- ${m?.name || ""}${m?.age ? ` (age ${m.age})` : ""}`);
      }
      lines.push(`Guardian Attestation: ${sigData.guardian_attested ? "Yes" : "N/A"}`);
      if (sigData.guardian_consent_text) lines.push(String(sigData.guardian_consent_text));
    }

    const pdfBytes = buildPdf(lines);

    // Compute SHA-256 hash
    const hashBuffer = await crypto.subtle.digest("SHA-256", pdfBytes);
    const pdfHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Store in dedicated private waiver-pdfs bucket
    const storageKey = `waivers/${envelope.org_id}/${envelope.id}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from("waiver-pdfs")
      .upload(storageKey, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
    }

    // Update envelope with pdf info
    await supabase.from("envelopes").update({
      pdf_storage_key: storageKey,
      pdf_hash: pdfHash,
    }).eq("id", envelope_id);

    // Auto-register as a document (no credit charge for waiver PDFs)
    await supabase.from("documents").insert({
      org_id: envelope.org_id,
      user_id: authData.user.id,
      filename: `waiver-${envelope.id.slice(0, 8)}.pdf`,
      storage_key: storageKey,
      file_size: pdfBytes.length,
      content_type: "application/pdf",
      source: "waiver_pdf",
      envelope_id: envelope.id,
    });

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="waiver-${envelope.id.slice(0, 8)}.pdf"`,
        "X-PDF-Hash": pdfHash,
      },
    });
  } catch (err: any) {
    console.error("generate-pdf error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
