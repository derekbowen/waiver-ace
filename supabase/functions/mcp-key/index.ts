// MCP endpoint authenticated with agent keys created in the app
// (Settings -> Agent access). Accepts a static `Authorization: Bearer rwa_...`
// header, which is what most MCP clients support in their config.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const headers = {
  ...corsHeaders,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, mcp-protocol-version, mcp-session-id",
  "Content-Type": "application/json",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://www.rentalwaivers.com";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Access = "read" | "full";
type Agent = { id: string; org_id: string; access: Access };

async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function authenticate(req: Request): Promise<Agent | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith("rwa_")) return null;
  const { data } = await admin
    .from("agent_keys")
    .select("id,org_id,access,is_active")
    .eq("key_hash", await sha256Hex(token))
    .maybeSingle();
  if (!data || !data.is_active) return null;
  void admin.from("agent_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { id: data.id, org_id: data.org_id, access: data.access as Access };
}

type Tool = {
  name: string;
  title: string;
  description: string;
  access: Access;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, any>, agent: Agent) => Promise<unknown>;
};

const objectSchema = (
  properties: Record<string, unknown>,
  required: string[] = [],
): Record<string, unknown> => ({ type: "object", properties, required, additionalProperties: false });

const TOOLS: Tool[] = [
  {
    name: "account_summary",
    title: "Account summary",
    description: "Organization name, remaining credits, and waiver counts by status.",
    access: "read",
    inputSchema: objectSchema({}),
    handler: async (_args, agent) => {
      const [{ data: org }, { data: wallet }, { data: rows }] = await Promise.all([
        admin.from("organizations").select("name").eq("id", agent.org_id).maybeSingle(),
        admin.from("wallets").select("credits").eq("org_id", agent.org_id).maybeSingle(),
        admin.from("envelopes").select("status").eq("org_id", agent.org_id).limit(5000),
      ]);
      const counts: Record<string, number> = {};
      for (const row of rows ?? []) counts[row.status] = (counts[row.status] ?? 0) + 1;
      return {
        organization: org?.name ?? null,
        credits_remaining: Number(wallet?.credits ?? 0),
        total_waivers: (rows ?? []).length,
        waivers_by_status: counts,
      };
    },
  },
  {
    name: "list_templates",
    title: "List waiver templates",
    description: "List the account's waiver templates, with the id needed to send a waiver.",
    access: "read",
    inputSchema: objectSchema({
      active_only: { type: "boolean", description: "Only active templates (default true)." },
    }),
    handler: async (args, agent) => {
      let query = admin
        .from("templates")
        .select("id,name,description,is_active,require_photo,require_video,updated_at")
        .eq("org_id", agent.org_id)
        .order("updated_at", { ascending: false });
      if (args.active_only !== false) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  },
  {
    name: "list_waivers",
    title: "List waivers",
    description: "List waivers (envelopes), newest first, optionally filtered by status or signer email.",
    access: "read",
    inputSchema: objectSchema({
      status: { type: "string", description: "Filter by status, e.g. sent, completed." },
      signer_email: { type: "string", description: "Filter by signer email." },
      limit: { type: "number", description: "Max rows (default 25, max 100)." },
    }),
    handler: async (args, agent) => {
      let query = admin
        .from("envelopes")
        .select("id,status,signer_name,signer_email,is_group_waiver,created_at,signed_at,expires_at,booking_id")
        .eq("org_id", agent.org_id)
        .order("created_at", { ascending: false })
        .limit(Math.min(Math.max(Number(args.limit ?? 25), 1), 100));
      if (args.status) query = query.eq("status", args.status);
      if (args.signer_email) query = query.ilike("signer_email", String(args.signer_email));
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  },
  {
    name: "get_waiver",
    title: "Get waiver",
    description: "Get one waiver by id, including status, signer details, and recent activity.",
    access: "read",
    inputSchema: objectSchema({ waiver_id: { type: "string", description: "The waiver id." } }, ["waiver_id"]),
    handler: async (args, agent) => {
      const { data, error } = await admin
        .from("envelopes")
        .select(
          "id,status,signer_name,signer_email,is_group_waiver,signing_token,group_token,created_at,signed_at,expires_at,booking_id,listing_id,credits_charged,pdf_storage_key",
        )
        .eq("org_id", agent.org_id)
        .eq("id", args.waiver_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error(`No waiver found with id ${args.waiver_id}`);
      const { data: events } = await admin
        .from("envelope_events")
        .select("event_type,created_at")
        .eq("envelope_id", data.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const pending = ["draft", "sent", "viewed"].includes(String(data.status));
      return {
        ...data,
        signing_token: undefined,
        signing_url: pending ? `${APP_ORIGIN}/waiver/${data.signing_token}` : null,
        events: events ?? [],
      };
    },
  },
  {
    name: "send_waiver",
    title: "Send a waiver",
    description:
      "Create a waiver from a template and email it to the signer. Deducts credits from the account.",
    access: "full",
    inputSchema: objectSchema(
      {
        template_id: { type: "string", description: "Template to send (see list_templates)." },
        signer_email: { type: "string", description: "Email of the person who must sign." },
        signer_name: { type: "string", description: "Name of the signer." },
        booking_id: { type: "string", description: "Your own booking reference." },
        rental_date: { type: "string", description: "Rental or effective date, YYYY-MM-DD." },
        expires_in_days: { type: "number", description: "Expire the waiver after this many days." },
      },
      ["template_id", "signer_email"],
    ),
    handler: async (args, agent) => {
      const { data: template } = await admin
        .from("templates")
        .select("id,require_photo,require_video")
        .eq("org_id", agent.org_id)
        .eq("id", args.template_id)
        .maybeSingle();
      if (!template) throw new Error(`No template found with id ${args.template_id}`);

      const { data: version } = await admin
        .from("template_versions")
        .select("id")
        .eq("template_id", args.template_id)
        .eq("is_current", true)
        .maybeSingle();
      if (!version) throw new Error("This template has no active version yet");

      const { data: org } = await admin
        .from("organizations")
        .select("logo_url,brand_color,brand_font")
        .eq("id", agent.org_id)
        .maybeSingle();

      const isBranded = Boolean(org?.logo_url || org?.brand_color || org?.brand_font);
      const cost = 1 + (template.require_photo ? 1 : 0) + (template.require_video ? 2 : 0) + (isBranded ? 1 : 0);

      const { data: envelope, error } = await admin
        .from("envelopes")
        .insert({
          org_id: agent.org_id,
          template_version_id: version.id,
          signer_email: String(args.signer_email),
          signer_name: args.signer_name ?? null,
          booking_id: args.booking_id ?? null,
          status: "sent",
          is_group_waiver: false,
          credits_charged: cost,
          expires_at: args.expires_in_days
            ? new Date(Date.now() + Number(args.expires_in_days) * 86400000).toISOString()
            : null,
          payload: { booking_id: args.booking_id ?? null, rental_date: args.rental_date ?? null },
        })
        .select("id,signing_token")
        .single();
      if (error) throw new Error(error.message);

      const { data: creditResult, error: creditErr } = await admin.rpc("deduct_credit", {
        p_org_id: agent.org_id,
        p_reference_id: envelope.id,
        p_type: "waiver_deduction",
        p_amount: cost,
        p_notes: "sent via agent key",
      } as never);
      const creditRow = (creditResult as unknown as Array<{ success?: boolean; error_message?: string }> | null)?.[0];
      if (creditErr || !creditRow?.success) {
        await admin.from("envelopes").update({ status: "canceled" }).eq("id", envelope.id);
        throw new Error(creditErr?.message || creditRow?.error_message || "Insufficient credits");
      }

      await admin.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.sent",
        metadata: { source: "agent_key", agent_key_id: agent.id, signer_email: args.signer_email },
      });

      const { error: emailErr } = await admin.functions.invoke("send-signing-email", {
        body: { envelope_id: envelope.id },
      });

      return {
        id: envelope.id,
        signing_url: `${APP_ORIGIN}/waiver/${envelope.signing_token}`,
        credits_charged: cost,
        email_sent: !emailErr,
      };
    },
  },
];

const toolsFor = (agent: Agent) =>
  TOOLS.filter((t) => agent.access === "full" || t.access === "read");

function rpcResult(id: unknown, result: unknown) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), { headers });
}

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    status,
    headers,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return rpcError(null, -32600, "Use POST", 405);

  const agent = await authenticate(req);
  if (!agent) {
    return new Response(JSON.stringify({ error: "invalid_agent_key" }), { status: 401, headers });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Invalid JSON");
  }

  const { id, method, params } = body ?? {};

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "rental-waivers", version: "1.0.0" },
        instructions:
          "Tools for Rental Waivers. Use account_summary for credits, list_templates to find a template id, send_waiver to email a waiver, and list_waivers / get_waiver to check signing status.",
      });
    case "notifications/initialized":
      return new Response(null, { status: 202, headers });
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, {
        tools: toolsFor(agent).map((t) => ({
          name: t.name,
          title: t.title,
          description: t.description,
          inputSchema: t.inputSchema,
          annotations: { readOnlyHint: t.access === "read", openWorldHint: false },
        })),
      });
    case "tools/call": {
      const tool = toolsFor(agent).find((t) => t.name === params?.name);
      if (!tool) {
        const exists = TOOLS.some((t) => t.name === params?.name);
        return rpcError(
          id,
          -32602,
          exists
            ? `Tool "${params?.name}" needs full access. This agent key is read-only.`
            : `Unknown tool: ${params?.name}`,
        );
      }
      try {
        const output = await tool.handler((params?.arguments ?? {}) as Record<string, any>, agent);
        return rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: { result: output },
        });
      } catch (e) {
        return rpcResult(id, {
          content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }],
          isError: true,
        });
      }
    }
    default:
      return rpcError(id, -32601, `Unknown method: ${method}`);
  }
});
