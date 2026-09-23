import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORT_PHONE = "909-272-8096";
const MAX_LEN = 800;

const SYSTEM_PROMPT = `You are the support assistant for RentalWaivers.com, a pay-per-use digital liability waiver platform for rental and activity businesses.

Facts you may use:
- Pricing: credits only, 6 cents per signed waiver, no monthly fees, no contract. 250 free credits to start.
- Waivers are legally binding under the ESIGN Act and UETA in all 50 US states.
- Features: templates, QR code and kiosk signing, group waivers, minors/guardian signing, audit trails, signed PDF storage, API, webhooks, Guesty/Hospitable/Lodgify integrations.
- Signers get an email link; admins can resend a signing email from the envelope page.

Rules:
- Answer in 1-3 short sentences. Plain language, no markdown headings.
- If you are not confident, if the question is about a specific account, billing problem, refund, bug, legal advice, or anything you cannot answer from the facts above, reply exactly: "Text us at ${SUPPORT_PHONE} and a real person will help you out."
- Never invent prices, policies, or features.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`support-chat:${ip}`, { windowMs: 60_000, maxRequests: 10 })) {
    return rateLimitResponse(corsHeaders);
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const trimmed = messages
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
      .slice(-8)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_LEN) }));

    if (trimmed.length === 0) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM_PROMPT,
        input: trimmed.map((m: any) => ({
          role: m.role,
          content: [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }],
        })),
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!res.ok || !res.body) {
      const status = res.status;
      const detail = await res.text().catch(() => "");
      console.error("support-chat gateway error", status, detail.slice(0, 500));
      const message =
        status === 429
          ? "Too many questions right now."
          : status === 402
            ? "Support assistant is temporarily unavailable."
            : "Support assistant is temporarily unavailable.";
      return new Response(
        JSON.stringify({ reply: `${message} Text us at ${SUPPORT_PHONE} and a real person will help you out.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Consume the SSE stream server-side and return the final answer.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          }
        } catch {
          // ignore keep-alive / partial frames
        }
      }
    }

    const reply = text.trim() || `Text us at ${SUPPORT_PHONE} and a real person will help you out.`;
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("support-chat error", err);
    return new Response(
      JSON.stringify({ reply: `Text us at ${SUPPORT_PHONE} and a real person will help you out.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
