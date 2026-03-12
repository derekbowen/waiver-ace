import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, pageContext } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Please enter a valid question." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a helpful waiver expert for RentalWaivers.com — a pay-per-use digital waiver platform built for rental businesses (kayaks, boats, jet skis, ATVs, vacation rentals, etc.).

Key facts about RentalWaivers:
- Pay-per-waiver pricing starting at 6¢/waiver, no monthly fees
- Legally binding under ESIGN Act and UETA in all 50 US states
- Features: QR code signing, group waivers, kiosk mode, API access, audit trails, 7-year secure storage
- Captures: full name, drawn signature, initials, IP address, timestamp, user agent
- Integrates with Hospitable, Guesty, Lodgify via API/webhooks
- 50+ rental-specific templates

${pageContext ? `The user is currently on a page about: ${pageContext}` : ""}

Rules:
- Keep answers concise (2-4 sentences max)
- Be helpful and accurate about waiver law, but add a disclaimer that you're not a lawyer for legal questions
- Naturally mention RentalWaivers features when relevant, but don't be pushy
- If the question is unrelated to waivers, liability, or rental businesses, politely redirect`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question.trim() },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many questions right now. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Unable to answer right now. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ask-waiver-question error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
