import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal PDF builder
function buildPdf(lines: string[]): Uint8Array {
  const enc = (s: string) => new TextEncoder().encode(s);
  const pdfEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const pageLines: string[] = [];
  pageLines.push("BT");
  pageLines.push("/F1 10 Tf");
  let y = 750;
  for (const line of lines) {
    if (y < 50) {
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
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`);
  objects.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`);
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip, { windowMs: 60_000, maxRequests: 30 })) {
      return rateLimitResponse(corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { envelope_id, group_signer_name, group_signer_email } = await req.json();

    if (!envelope_id) {
      return new Response(JSON.stringify({ error: "envelope_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: envelope, error: envErr } = await supabase
      .from("envelopes")
      .select("*, template_versions(content, version, template_id)")
      .eq("id", envelope_id)
      .single();

    if (envErr || !envelope) {
      return new Response(JSON.stringify({ error: "Envelope not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", envelope.org_id)
      .single();

    const { data: template } = await supabase
      .from("templates")
      .select("name")
      .eq("id", (envelope.template_versions as any)?.template_id)
      .single();

    const orgName = org?.name || "Rental Waivers";
    const templateName = template?.name || "Waiver Agreement";
    const signerName = group_signer_name || envelope.signer_name || "Guest";
    const signerEmail = group_signer_email || envelope.signer_email;
    const isGroup = envelope.is_group_waiver;
    const signedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const signedDateTime = new Date().toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    // --- Auto-generate PDF and store it ---
    let pdfDownloadUrl = "";
    try {
      const content = (envelope.template_versions as any)?.content?.body || "";
      const payload = (envelope.payload as Record<string, any>) || {};
      let rendered = content;
      Object.entries(payload).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
      });
      rendered = rendered.replace(/\{\{customer_name\}\}/g, envelope.signer_name || "");
      rendered = rendered.replace(/\{\{date\}\}/g, envelope.signed_at ? new Date(envelope.signed_at).toLocaleDateString() : "");

      const sigData = (envelope.signature_data as Record<string, any>) || {};

      const lines: string[] = [
        `Organization: ${orgName}`,
        `Document: ${templateName}`,
        `Envelope ID: ${envelope.id}`,
        "",
        "---",
        "",
      ];

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

      // Store in private bucket
      const storageKey = `waivers/${envelope.org_id}/${envelope.id}.pdf`;
      await supabase.storage
        .from("waiver-pdfs")
        .upload(storageKey, pdfBytes, { contentType: "application/pdf", upsert: true });

      // Update envelope with pdf info
      await supabase.from("envelopes").update({
        pdf_storage_key: storageKey,
        pdf_hash: pdfHash,
      }).eq("id", envelope_id);

      // Generate a time-limited signed URL for the email (valid 7 days)
      const { data: signedUrl } = await supabase.storage
        .from("waiver-pdfs")
        .createSignedUrl(storageKey, 7 * 24 * 60 * 60); // 7 days

      pdfDownloadUrl = signedUrl?.signedUrl || "";
    } catch (pdfErr) {
      console.error("Non-fatal: PDF generation failed:", pdfErr);
    }

    const emails: Promise<any>[] = [];
    const origin = req.headers.get("origin") || "https://rentalwaivers.com";

    // Build PDF link sections
    const pdfSections = pdfDownloadUrl ? [
      {
        type: 'button' as const,
        content: 'Download Signed Waiver (PDF)',
        href: pdfDownloadUrl,
      },
      {
        type: 'small' as const,
        content: 'This download link expires in 7 days. You can also access the signed waiver from your dashboard at any time.',
      },
    ] : [];

    // 1. Confirmation to signer — with PDF download link
    if (signerEmail && signerEmail !== "group@placeholder.local") {
      const signerHtml = buildEmail({
        previewText: `Your waiver has been signed successfully — ${orgName}`,
        orgName,
        greeting: `Hi ${signerName},`,
        sections: [
          {
            type: 'callout',
            variant: 'success',
            content: 'Your waiver has been signed and recorded successfully.',
          },
          {
            type: 'text',
            content: 'Here are the details of your signed document:',
          },
          {
            type: 'table',
            rows: [
              { label: 'Document', value: templateName },
              { label: 'Signed by', value: signerName },
              { label: 'Date', value: signedDate },
              { label: 'Envelope ID', value: `<code style="font-family:monospace;font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${envelope_id.slice(0, 8)}…</code>` },
              ...(envelope.booking_id ? [{ label: 'Booking', value: envelope.booking_id }] : []),
            ],
          },
          ...pdfSections,
          {
            type: 'small',
            content: 'Please keep this email and the attached PDF for your records. If you have questions about this waiver, contact the organization directly.',
          },
        ],
        footerText: `This confirmation was sent to ${signerEmail} because a waiver was signed on behalf of ${orgName}.`,
      });

      emails.push(
        sendEmail({
          to: signerEmail,
          subject: `✓ Waiver Signed — Your copy from ${orgName}`,
          html: signerHtml,
        })
      );
    }

    // 2. Notification to admin(s)/host — with PDF download link
    const { data: admins } = await supabase
      .from("profiles")
      .select("email")
      .eq("org_id", envelope.org_id);

    const adminEmails = (admins || []).map((a: any) => a.email).filter(Boolean);

    if (adminEmails.length > 0) {
      const adminHtml = buildEmail({
        previewText: `${signerName} just signed a waiver — PDF copy attached`,
        orgName,
        sections: [
          {
            type: 'heading',
            content: 'New Waiver Signed',
          },
          {
            type: 'text',
            content: `${isGroup ? "A guest in a group waiver" : `<strong>${signerName}</strong>`} just signed <strong>${templateName}</strong>${envelope.booking_id ? ` for booking <strong>${envelope.booking_id}</strong>` : ""}.`,
          },
          {
            type: 'table',
            rows: [
              { label: 'Document', value: templateName },
              { label: 'Signer', value: signerName },
              ...(signerEmail && signerEmail !== "group@placeholder.local" ? [{ label: 'Email', value: signerEmail }] : []),
              { label: 'Type', value: isGroup ? 'Group Waiver' : 'Individual' },
              { label: 'Date', value: signedDateTime },
              ...(envelope.booking_id ? [{ label: 'Booking', value: envelope.booking_id }] : []),
            ],
          },
          ...pdfSections,
          {
            type: 'button',
            content: 'View in Dashboard',
            href: `${origin}/envelopes/${envelope_id}`,
          },
        ],
      });

      emails.push(
        sendEmail({
          to: adminEmails,
          subject: `Waiver Signed by ${signerName} — ${templateName}${envelope.booking_id ? ` (Booking ${envelope.booking_id})` : ""}`,
          html: adminHtml,
        })
      );
    }

    const results = await Promise.allSettled(emails);
    const sent = results.filter((r) => r.status === "fulfilled").length;

    return new Response(
      JSON.stringify({ success: true, emails_sent: sent, pdf_generated: !!pdfDownloadUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending completion email:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
