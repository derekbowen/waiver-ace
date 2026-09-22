import { defineTool } from "@lovable.dev/mcp-js";
import { requireOrgId, supabaseForUser } from "../supabase";

export default defineTool({
  name: "account_summary",
  title: "Account summary",
  description:
    "Summarize the signed-in account: organization name, remaining credits, and waiver counts by status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());

    const [{ data: org }, { data: wallet }, { data: rows }] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
      supabase.from("wallets").select("credits").eq("org_id", orgId).maybeSingle(),
      supabase.from("envelopes").select("status").eq("org_id", orgId).limit(5000),
    ]);

    const counts: Record<string, number> = {};
    for (const row of rows ?? []) {
      const status = String((row as Record<string, unknown>).status);
      counts[status] = (counts[status] ?? 0) + 1;
    }

    const summary = {
      organization: (org as Record<string, unknown> | null)?.name
        ? String((org as Record<string, unknown>).name)
        : null,
      credits_remaining: Number((wallet as Record<string, unknown> | null)?.credits ?? 0),
      total_waivers: (rows ?? []).length,
      waivers_by_status: counts,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: { summary },
    };
  },
});
