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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const { job_id, enhancements } = await req.json();
    if (!job_id) throw new Error("job_id required");

    // Get job
    const { data: job, error: jobError } = await supabase
      .from("photo_jobs")
      .select("*")
      .eq("id", job_id)
      .single();
    if (jobError || !job) throw new Error("Job not found");

    // Deduct credit
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", userData.user.id)
      .single();

    if (!profile?.org_id) throw new Error("No organization found");

    const { data: deductResult } = await supabase.rpc("deduct_credit", {
      p_org_id: profile.org_id,
      p_reference_id: job_id,
      p_type: "waiver_deduction",
      p_amount: 5,
      p_notes: "PhotoSell enhancement — 5 credits",
    });

    const result = deductResult?.[0];
    if (!result?.success) {
      throw new Error(result?.error_message || "Insufficient credits");
    }

    await supabase.from("photo_jobs").update({ status: "enhancing" }).eq("id", job_id);

    // Get signed URL
    const { data: signedUrl } = await supabase.storage
      .from("photo-uploads")
      .createSignedUrl(job.original_storage_key, 600);
    if (!signedUrl?.signedUrl) throw new Error("Could not access photo");

    // Download image
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

    // Build enhancement prompt based on analysis and requested enhancements
    const analysis = job.analysis_json;
    const enhancementList = enhancements || analysis?.enhancements_recommended || [];

    let prompt = "Enhance this rental property photo for a professional listing. ";
    if (enhancementList.includes("replace_overcast_sky")) {
      prompt += "Replace the overcast/gray sky with a beautiful clear blue sky with soft white clouds. ";
    }
    if (enhancementList.includes("boost_saturation")) {
      prompt += "Boost the color saturation slightly to make the image more vibrant. ";
    }
    if (enhancementList.includes("enhance_water")) {
      prompt += "Make the pool water appear crystal clear and inviting blue. ";
    }
    if (enhancementList.includes("improve_lighting")) {
      prompt += "Improve the overall lighting to be warm and inviting. ";
    }
    if (enhancementList.includes("remove_clutter")) {
      prompt += "Remove any visible clutter or distracting objects. ";
    }
    prompt += "Keep the photo looking natural and realistic. Professional real estate photography quality.";

    const startTime = Date.now();

    // Use Gemini image editing model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI enhance error:", aiResponse.status, errText);
      // Refund credit on failure
      await supabase.rpc("add_credits", {
        p_org_id: profile.org_id,
        p_amount: 5,
        p_reference_id: job_id,
        p_type: "refund",
        p_notes: "PhotoSell enhancement failed - refund",
      });
      await supabase.from("photo_jobs").update({ status: "failed", error_message: "Enhancement failed" }).eq("id", job_id);
      throw new Error(`Enhancement failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    const images = aiData.choices?.[0]?.message?.images;

    // The image model returns images in a separate "images" array
    let enhancedImageData: string | null = null;

    // Check the images array first (primary response format)
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.type === "image_url" && img.image_url?.url) {
          enhancedImageData = img.image_url.url;
          break;
        }
      }
    }

    // Fallback: check if content has inline images
    if (!enhancedImageData && Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url) {
          enhancedImageData = part.image_url.url;
          break;
        }
      }
    } else if (!enhancedImageData && typeof content === "string" && content.startsWith("data:image")) {
      enhancedImageData = content;
    }

    console.log("AI response has images:", !!enhancedImageData, "images array length:", images?.length ?? 0);

    const processedKeys: string[] = [];

    if (enhancedImageData) {
      // Extract base64 data
      const matches = enhancedImageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const rawBase64 = matches[2];
        const bytes = Uint8Array.from(atob(rawBase64), c => c.charCodeAt(0));

        const enhancedKey = `${profile.org_id}/${job_id}/enhanced.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("photo-uploads")
          .upload(enhancedKey, bytes, { contentType: `image/${matches[1]}`, upsert: true });

        if (!uploadError) {
          processedKeys.push(enhancedKey);
        } else {
          console.error("Upload error:", uploadError);
        }
      }
    }

    const processingTime = Date.now() - startTime;

    await supabase.from("photo_jobs").update({
      status: processedKeys.length > 0 ? "completed" : "failed",
      processed_keys: processedKeys,
      processing_time_ms: (job.processing_time_ms || 0) + processingTime,
      completed_at: new Date().toISOString(),
      settings: { enhancements: enhancementList },
      error_message: processedKeys.length === 0 ? "No enhanced image generated" : null,
    }).eq("id", job_id);

    return new Response(JSON.stringify({
      success: processedKeys.length > 0,
      processed_keys: processedKeys,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("enhance-photo error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
