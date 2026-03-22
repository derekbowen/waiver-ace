import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");
    const userId = userData.user.id;

    const { job_id } = await req.json();
    if (!job_id) throw new Error("job_id required");

    // Get job
    const { data: job, error: jobError } = await supabase
      .from("photo_jobs")
      .select("*")
      .eq("id", job_id)
      .single();
    if (jobError || !job) throw new Error("Job not found");

    // Update status
    await supabase.from("photo_jobs").update({ status: "analyzing" }).eq("id", job_id);

    // Get signed URL for the original image
    const { data: signedUrl } = await supabase.storage
      .from("photo-uploads")
      .createSignedUrl(job.original_storage_key, 600);
    if (!signedUrl?.signedUrl) throw new Error("Could not access uploaded photo");

    // Download the image and convert to base64
    const imageResponse = await fetch(signedUrl.signedUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const bytes = new Uint8Array(imageBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64Image = btoa(binary);
    const mimeType = job.original_content_type || "image/jpeg";

    const startTime = Date.now();

    // Call Lovable AI with vision
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional real estate and vacation rental photo analyst. Analyze photos for listing optimization. Always respond with a tool call.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` }
              },
              {
                type: "text",
                text: "Analyze this rental property / pool / backyard photo for listing optimization. Score it and provide detailed improvement recommendations."
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "photo_analysis",
              description: "Return structured photo analysis results",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Photo quality score 1-10" },
                  composition: {
                    type: "object",
                    properties: {
                      horizon_tilt_degrees: { type: "number" },
                      rule_of_thirds: { type: "boolean" },
                      framing_issues: { type: "array", items: { type: "string" } }
                    },
                    required: ["horizon_tilt_degrees", "rule_of_thirds", "framing_issues"]
                  },
                  lighting: {
                    type: "object",
                    properties: {
                      quality: { type: "string", enum: ["excellent", "good", "poor", "harsh"] },
                      sky_condition: { type: "string", enum: ["blue", "overcast", "sunset", "night", "indoor"] },
                      shadows: { type: "string", enum: ["balanced", "harsh", "flat"] },
                      recommendation: { type: "string" }
                    },
                    required: ["quality", "sky_condition", "shadows", "recommendation"]
                  },
                  clutter: {
                    type: "object",
                    properties: {
                      detected_objects: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            object: { type: "string" },
                            location: { type: "string" },
                            remove_priority: { type: "string", enum: ["high", "medium", "low"] }
                          },
                          required: ["object", "location", "remove_priority"]
                        }
                      }
                    },
                    required: ["detected_objects"]
                  },
                  water_quality: {
                    type: "object",
                    properties: {
                      color: { type: "string", enum: ["clear_blue", "green", "murky", "reflective", "not_applicable"] },
                      needs_enhancement: { type: "boolean" }
                    },
                    required: ["color", "needs_enhancement"]
                  },
                  enhancements_recommended: {
                    type: "array",
                    items: { type: "string" }
                  },
                  summary: { type: "string", description: "Brief human-readable summary of the analysis" }
                },
                required: ["overall_score", "composition", "lighting", "clutter", "water_quality", "enhancements_recommended", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "photo_analysis" } }
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        await supabase.from("photo_jobs").update({ status: "failed", error_message: "Rate limited, please try again shortly" }).eq("id", job_id);
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Failed to parse AI analysis");
    }

    const processingTime = Date.now() - startTime;

    // Update job with analysis
    await supabase.from("photo_jobs").update({
      status: "analyzed",
      analysis_json: analysis,
      processing_time_ms: processingTime,
    }).eq("id", job_id);

    return new Response(JSON.stringify({ success: true, analysis, processing_time_ms: processingTime }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-photo error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
