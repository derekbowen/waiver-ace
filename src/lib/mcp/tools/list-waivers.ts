import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireOrgId, supabaseForUser } from "../supabase";

const toWaiverJson = (row: Record<string, unknown>) => ({
  id: String(row.id),
  status: String(row.status),
  signer_name: (row.signer_name as string | null) ?? null,
  signer_email: String(row.signer_email),
  is_group_waiver: Boolean(row.is_group_waiver),
  created_at: String(row.created_at),
  signed_at: (row.signed_at as string | null) ?? null,
  expires_at: (row.expires_at as string | null) ?? null,
  booking_id: (row.booking_id as string | null) ?? null,
});

export default defineTool({
  name: "list_waivers",
  title: "List waivers",
  description:
    "List the signed-in account's waivers (envelopes), newest first, optionally filtered by status or signer email.",
  inputSchema: {
    status: z
      .enum(["draft", "sent", "viewed", "completed", "expired", "canceled"])
      .optional()
      .describe("Only return waivers with this status."),
    signer_email: z.string().trim().optional().describe("Only return waivers for this signer email."),
    limit: z.number().int().min(1).max(100).optional().describe("Maximum waivers to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, signer_email, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());

    let query = supabase
      .from("envelopes")
      .select(
        "id,status,signer_name,signer_email,is_group_waiver,created_at,signed_at,expires_at,booking_id",
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (status) query = query.eq("status", status);
    if (signer_email) query = query.ilike("signer_email", signer_email);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const waivers = (data ?? []).map((row) => toWaiverJson(row as Record<string, unknown>));
    return {
      content: [{ type: "text", text: JSON.stringify(waivers, null, 2) }],
      structuredContent: { waivers },
    };
  },
});
