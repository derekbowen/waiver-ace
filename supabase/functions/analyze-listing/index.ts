import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert listing optimization consultant for vacation rental and pool rental platforms. You will receive a listing URL and platform name. Analyze the listing comprehensively and return a structured audit.

Your analysis MUST cover ALL of these categories. For EVERY recommendation you MUST explain:
1. What to change — exact wording, exact fix
2. Why it matters — specific reason this hurts bookings or Google ranking
3. What to charge — recommended pricing for this listing type, market rate, and whether they're over or underpriced
4. SEO impact — how this change affects Google search visibility
5. Booking conversion impact — how this change affects whether a visitor books

Categories to analyze:

1. TITLE_OPTIMIZATION — Is it keyword-rich? Does it include location, pool type, amenity highlights?
2. DESCRIPTION_ANALYSIS — Length, keyword density, emotional hooks, missing details
3. PRICING_STRATEGY — Daily rate, weekend rate, seasonal pricing, cleaning fee, minimum nights
4. PHOTOS — Number recommended, order, what shots are missing, alt text if applicable
5. AMENITIES_FEATURES — What's listed, what's missing, what to highlight more
6. HOUSE_RULES — Too strict? Too loose? How rules affect booking rate
7. AVAILABILITY_CALENDAR — Minimum stay, advance notice, instant book settings
8. RESPONSE_RATE — How this affects ranking on each platform
9. REVIEWS_STRATEGY — How to get more, what to respond to, how reviews affect SEO
10. GOOGLE_SEO — Page title, meta description, local keywords, schema markup
11. COMPETITIVE_POSITIONING — How this listing compares to market, what makes it unique

Return your response as a JSON object with this exact structure:
{
  "overall_score": <integer 0-100>,
  "potential_score": <integer 0-100>,
  "estimated_revenue_increase": "<string e.g. '15-25% increase in monthly bookings'>",
  "summary": "<2-3 sentence executive summary>",
  "top_priorities": [
    { "title": "<string>", "description": "<string>", "impact": "<string>" }
  ],
  "categories": [
    {
      "id": "<snake_case category id>",
      "name": "<Display Name>",
      "icon": "<lucide icon name>",
      "score": "<good|warning|critical|info>",
      "priority": "<critical|high|medium|low>",
      "current_status": "<1-2 sentence current state>",
      "what_to_change": "<detailed recommendation with exact wording>",
      "why_it_matters": "<specific reason>",
      "pricing_recommendation": "<pricing advice>",
      "seo_impact": "<SEO effect>",
      "booking_impact": "<conversion effect>"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks. Always include all 11 categories. Be specific, actionable, and data-driven in every recommendation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { listing_url, platform, analysis_id } = await req.json();
    if (!listing_url || !platform) {
      return new Response(JSON.stringify({ error: "listing_url and platform are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user org
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct 40 credits
    const { data: deductResult } = await serviceClient.rpc("deduct_credit", {
      p_org_id: profile.org_id,
      p_reference_id: analysis_id || "listing-analysis",
      p_type: "waiver_deduction",
      p_amount: 40,
      p_notes: `Listing analysis: ${listing_url}`,
    });

    const deduct = Array.isArray(deductResult) ? deductResult[0] : deductResult;
    if (!deduct?.success) {
      return new Response(JSON.stringify({ error: deduct?.error_message || "Insufficient credits" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If analysis_id was provided, update status to processing
    if (analysis_id) {
      await serviceClient
        .from("listing_analyses")
        .update({ status: "processing" })
        .eq("id", analysis_id);
    }

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this listing:\n\nURL: ${listing_url}\nPlatform: ${platform}\n\nProvide a comprehensive listing audit with actionable recommendations for every category.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        // Refund credits on rate limit
        await serviceClient.rpc("add_credits_internal", {
          p_org_id: profile.org_id,
          p_amount: 40,
          p_reference_id: analysis_id || "listing-analysis-refund",
          p_type: "refund",
          p_notes: "Refund: AI rate limited",
        });
        return new Response(JSON.stringify({ error: "AI service is busy. Credits refunded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysis;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      // Refund on parse failure
      await serviceClient.rpc("add_credits_internal", {
        p_org_id: profile.org_id,
        p_amount: 40,
        p_reference_id: analysis_id || "listing-analysis-refund",
        p_type: "refund",
        p_notes: "Refund: AI response parse error",
      });
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis. Credits refunded." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update analysis record
    if (analysis_id) {
      await serviceClient
        .from("listing_analyses")
        .update({
          status: "completed",
          overall_score: analysis.overall_score,
          potential_score: analysis.potential_score,
          estimated_revenue_increase: analysis.estimated_revenue_increase,
          top_priorities: analysis.top_priorities,
          categories: analysis.categories,
          summary: analysis.summary,
        })
        .eq("id", analysis_id);
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-listing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
