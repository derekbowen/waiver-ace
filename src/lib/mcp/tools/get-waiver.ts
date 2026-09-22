import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireOrgId, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_waiver",
  title: "Get waiver",
  description:
    "Get one waiver by its id, including status, signer details, signing link, and recent activity events.",
  inputSchema: { waiver_id: z.string().uuid().describe("The waiver (envelope) id.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ waiver_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());

    const { data, error } = await supabase
      .from("envelopes")
      .select(
        "id,status,signer_name,signer_email,is_group_waiver,signing_token,group_token,created_at,signed_at,expires_at,booking_id,listing_id,credits_charged,pdf_storage_key",
      )
      .eq("org_id", orgId)
      .eq("id", waiver_id)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) throw new ToolError(`No waiver found with id ${waiver_id}`);

    const { data: events } = await supabase
      .from("envelope_events")
      .select("event_type,created_at")
      .eq("envelope_id", waiver_id)
      .order("created_at", { ascending: false })
      .limit(10);

    const row = data as Record<string, unknown>;
    const signingPath = row.is_group_waiver
      ? row.group_token
        ? `/group/${String(row.group_token)}`
        : null
      : `/waiver/${String(row.signing_token)}`;

    const waiver = {
      id: String(row.id),
      status: String(row.status),
      signer_name: (row.signer_name as string | null) ?? null,
      signer_email: String(row.signer_email),
      is_group_waiver: Boolean(row.is_group_waiver),
      signing_url: signingPath ? `https://www.rentalwaivers.com${signingPath}` : null,
      created_at: String(row.created_at),
      signed_at: (row.signed_at as string | null) ?? null,
      expires_at: (row.expires_at as string | null) ?? null,
      booking_id: (row.booking_id as string | null) ?? null,
      listing_id: (row.listing_id as string | null) ?? null,
      credits_charged: Number(row.credits_charged ?? 0),
      has_signed_pdf: Boolean(row.pdf_storage_key),
      recent_events: (events ?? []).map((e) => ({
        event_type: String((e as Record<string, unknown>).event_type),
        created_at: String((e as Record<string, unknown>).created_at),
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(waiver, null, 2) }],
      structuredContent: { waiver },
    };
  },
});
