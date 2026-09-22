import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireOrgId, supabaseForUser } from "../supabase";

export default defineTool({
  name: "send_waiver",
  title: "Send a waiver",
  description:
    "Create a waiver from a template and email it to the signer. Deducts credits from the account, the same as sending from the app.",
  inputSchema: {
    template_id: z.string().uuid().describe("Template to send (see list_templates)."),
    signer_email: z.string().trim().email().describe("Email address of the person who must sign."),
    signer_name: z.string().trim().optional().describe("Name of the signer."),
    booking_id: z.string().trim().optional().describe("Your own booking or reservation reference."),
    rental_date: z
      .string()
      .trim()
      .optional()
      .describe("Rental or effective date for the waiver, as YYYY-MM-DD."),
    expires_in_days: z
      .number()
      .int()
      .min(1)
      .max(365)
      .optional()
      .describe("Expire the waiver after this many days."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (args, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());

    const { data: template, error: templateErr } = await supabase
      .from("templates")
      .select("id,require_photo,require_video")
      .eq("org_id", orgId)
      .eq("id", args.template_id)
      .maybeSingle();
    if (templateErr) return { content: [{ type: "text", text: templateErr.message }], isError: true };
    if (!template) throw new ToolError(`No template found with id ${args.template_id}`);

    const { data: version } = await supabase
      .from("template_versions")
      .select("id")
      .eq("template_id", args.template_id)
      .eq("is_current", true)
      .maybeSingle();
    if (!version) throw new ToolError("This template has no active version yet");

    const { data: org } = await supabase
      .from("organizations")
      .select("logo_url,brand_color,brand_font")
      .eq("id", orgId)
      .maybeSingle();

    const t = template as Record<string, unknown>;
    const o = (org ?? {}) as Record<string, unknown>;
    const isBranded = Boolean(o.logo_url || o.brand_color || o.brand_font);
    const cost = 1 + (t.require_photo ? 1 : 0) + (t.require_video ? 2 : 0) + (isBranded ? 1 : 0);

    const { data: envelope, error } = await supabase
      .from("envelopes")
      .insert({
        org_id: orgId,
        template_version_id: (version as Record<string, unknown>).id as string,
        signer_email: args.signer_email,
        signer_name: args.signer_name ?? null,
        booking_id: args.booking_id ?? null,
        status: "sent",
        is_group_waiver: false,
        credits_charged: cost,
        expires_at: args.expires_in_days
          ? new Date(Date.now() + args.expires_in_days * 86400000).toISOString()
          : null,
        payload: { booking_id: args.booking_id ?? null, rental_date: args.rental_date ?? null },
      })
      .select("id,signing_token")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const envelopeRow = envelope as Record<string, unknown>;
    const envelopeId = String(envelopeRow.id);

    const { data: creditResult, error: creditErr } = await supabase.rpc("deduct_credit", {
      p_org_id: orgId,
      p_reference_id: envelopeId,
      p_type: "waiver_deduction",
      p_amount: cost,
      p_notes: "sent via agent integration",
    } as never);

    const creditRow = (creditResult as unknown as Array<{ success?: boolean; error_message?: string }> | null)?.[0];
    if (creditErr || !creditRow?.success) {
      await supabase.from("envelopes").update({ status: "canceled" }).eq("id", envelopeId);
      throw new ToolError(creditErr?.message || creditRow?.error_message || "Insufficient credits");
    }

    await supabase.from("envelope_events").insert({
      envelope_id: envelopeId,
      event_type: "envelope.sent",
      metadata: { source: "mcp", signer_email: args.signer_email },
    });

    let emailSent = true;
    const { error: emailErr } = await supabase.functions.invoke("send-signing-email", {
      body: { envelope_id: envelopeId },
    });
    if (emailErr) emailSent = false;

    const waiver = {
      id: envelopeId,
      signing_url: `https://www.rentalwaivers.com/waiver/${String(envelopeRow.signing_token)}`,
      credits_charged: cost,
      email_sent: emailSent,
    };

    return {
      content: [
        {
          type: "text",
          text: emailSent
            ? `Waiver sent to ${args.signer_email}. Signing link: ${waiver.signing_url}`
            : `Waiver created for ${args.signer_email}, but the email failed to send. Share this link instead: ${waiver.signing_url}`,
        },
      ],
      structuredContent: { waiver },
    };
  },
});
