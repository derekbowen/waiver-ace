import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireOrgId, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_templates",
  title: "List waiver templates",
  description: "List the account's waiver templates, with the id needed to send a waiver.",
  inputSchema: {
    active_only: z.boolean().optional().describe("Only return active templates (default true)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ active_only }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());

    let query = supabase
      .from("templates")
      .select("id,name,description,is_active,require_photo,require_video,updated_at")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (active_only !== false) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const templates = (data ?? []).map((row) => {
      const t = row as Record<string, unknown>;
      return {
        id: String(t.id),
        name: String(t.name),
        description: (t.description as string | null) ?? null,
        is_active: Boolean(t.is_active),
        require_photo: Boolean(t.require_photo),
        require_video: Boolean(t.require_video),
        updated_at: String(t.updated_at),
      };
    });

    return {
      content: [{ type: "text", text: JSON.stringify(templates, null, 2) }],
      structuredContent: { templates },
    };
  },
});
