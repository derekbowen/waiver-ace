import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal PDF generation without external libraries.
function buildPdf(lines: string[]): Uint8Array {
  const enc = (s: string) => new TextEncoder().encode(s);

  // Escape special PDF characters
  const pdfEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  // Build page content: simple text rendering
  const pageLines: string[] = [];
  pageLines.push("BT");
  pageLines.push("/F1 10 Tf");

  let y = 750;
  for (const line of lines) {
    if (y < 50) {
      // Simple overflow handling: stop adding
      pageLines.push(`1 0 0 1 50 ${y} Tm`);
      pageLines.push(`(${pdfEscape("[content continues...]")}) Tj`);
      break;
    }
    pageLines.push(`1 0 0 1 50 ${y} Tm`);
    pageLines.push(`(${pdfEscape(line)}) Tj`);
    y -= 14;
  }
  pageLines.push("ET");
  const stream = pageLines.join("\n");

  const objects: string[] = [];
  // 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  // 2: Pages
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  // 3: Page
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`);
  // 4: Stream
  objects.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`);
  // 5: Font
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj + "\n";
  }

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (const off of offsets) {
    body += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += `startxref\n${xrefStart}\n%%EOF`;

  return enc(body);
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
    let rendered = content;
    Object.entries(payload).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
    });
    rendered = rendered.replace(/\{\{customer_name\}\}/g, envelope.signer_name || "");
    rendered = rendered.replace(/\{\{date\}\}/g, envelope.signed_at ? new Date(envelope.signed_at).toLocaleDateString() : "");

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
