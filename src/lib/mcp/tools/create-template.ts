import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireOrgId, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_template",
  title: "Create a waiver template",
  description:
    "Create a new waiver template from the full waiver text. Placeholders like {{signer_name}} or {{business_name}} are filled in when sent. Free — no credits used. Returns the template id for send_waiver.",
  inputSchema: {
    name: z.string().trim().min(1).max(200).describe("Template name, e.g. 'Kayak Rental Waiver'."),
    body: z.string().trim().min(20).describe("Full waiver text the guest reads and signs."),
    description: z.string().trim().optional().describe("Short internal description."),
    require_photo: z.boolean().optional().describe("Require a signer photo (+1 credit per waiver)."),
    allow_minors: z.boolean().optional().describe("Let signers add minors/dependents (default false)."),
    default_expiration_days: z.number().int().min(1).max(365).optional().describe("Default days before an unsigned waiver expires."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (args, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const orgId = await requireOrgId(supabase, ctx.getUserId());
    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        org_id: orgId,
        name: args.name,
        description: args.description ?? null,
        require_photo: args.require_photo ?? false,
        allow_minors: args.allow_minors ?? false,
        require_video: false,
        default_expiration_days: args.default_expiration_days ?? null,
        created_by: ctx.getUserId(),
      } as never)
      .select("id")
      .single();
    if (error || !template) throw new ToolError(error?.message ?? "Could not create template");
    const templateId = String((template as Record<string, unknown>).id);
    const variables = [...new Set([...args.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
    const { error: vErr } = await supabase.from("template_versions").insert({
      template_id: templateId,
      version: 1,
      content: { body: args.body },
      variables,
      is_current: true,
    } as never);
    if (vErr) {
      await supabase.from("templates").delete().eq("id", templateId);
      throw new ToolError(vErr.message);
    }
    const result = { id: templateId, name: args.name, variables };
    return {
      content: [{ type: "text", text: `Template "${args.name}" created. id: ${templateId}` }],
      structuredContent: { template: result },
    };
  },
});
