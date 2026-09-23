import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX = 400;
const clean = (v: unknown) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, MAX) : "");

const SYSTEM_PROMPT = `You draft plain-English liability waiver and release documents for U.S. rental, housing, and activity businesses.

Output rules:
- Return ONLY the waiver document text. No preamble, no commentary, no markdown code fences.
- Use clear numbered sections with SHORT ALL-CAPS headings (e.g. "1. ASSUMPTION OF RISK").
- Always include, adapted to the described business: assumption of risk with the SPECIFIC hazards named; release and waiver of liability; indemnification; rules and conduct; damage responsibility; medical treatment authorization; minors and guardian consent; photo/media consent as a separate opt-in; severability; governing law naming the state given; and a signature block.
- Use merge fields exactly as written where relevant: {{signer_name}}, {{signer_email}}, {{rental_date}}, {{minor_names}}, {{date}}.
- Name specific risks rather than generic "all activities involve risk" language.
- Never state that the document waives gross negligence, recklessness, or any non-waivable statutory duty.
- End with this line exactly: "This document is a starting point and is not legal advice. Have an attorney licensed in your state review it before use."
- Target 600-900 words.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`generate-waiver:${ip}`, { windowMs: 60 * 60_000, maxRequests: 8 })) {
    return rateLimitResponse(corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const businessType = clean(body?.businessType);
    const state = clean(body?.state);
    const businessName = clean(body?.businessName) || "[Your Business Name]";
    const activities = clean(body?.activities);
    const minors = body?.minors === true;

    if (!businessType) {
      return new Response(JSON.stringify({ error: "Tell us what kind of business this waiver is for." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = [
      `Business name: ${businessName}`,
      `Business type: ${businessType}`,
      `State / governing law: ${state || "the state where the business operates"}`,
      activities ? `Activities, amenities or property involved: ${activities}` : "",
      minors
        ? "Minors under 18 will participate: include a full guardian consent section using {{minor_names}}."
        : "Adults only: keep the minor section brief.",
      "Draft the waiver now.",
    ]
      .filter(Boolean)
      .join("\n");

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
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!res.ok || !res.body) {
      const status = res.status;
      const detail = await res.text().catch(() => "");
      console.error("generate-waiver gateway error", status, detail.slice(0, 500));
      const message =
        status === 429
          ? "The waiver generator is busy right now. Try again in a minute."
          : status === 402
            ? "The waiver generator is temporarily unavailable. Text 909-272-8096 and we'll send you a template."
            : "The waiver generator is temporarily unavailable. Text 909-272-8096 and we'll send you a template.";
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
        } catch {
          // ignore keep-alive frames
        }
      }
    }

    const waiver = text.trim();
    if (!waiver) {
      return new Response(
        JSON.stringify({ error: "We couldn't draft that one. Try describing the business a bit differently." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ waiver }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-waiver error", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong generating the waiver. Text 909-272-8096 and we'll help." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
