import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const FREE_QUOTA = 100 * 1024 * 1024; // 100MB

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get caller's org
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", authData.user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("org_id", profile.org_id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate content type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: "File type not allowed. Accepted: PDF, DOCX, XLSX, JPG, PNG, WEBP" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "File exceeds 25MB limit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check storage quota
    const { data: wallet } = await supabase
      .from("wallets")
      .select("credits, storage_used_bytes")
      .eq("org_id", profile.org_id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: "No wallet found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((wallet.storage_used_bytes || 0) + file.size > FREE_QUOTA) {
      return new Response(JSON.stringify({ error: "Storage quota exceeded (100MB free tier)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct 1 credit
    const { data: deductResult } = await supabase.rpc("deduct_credit", {
      p_org_id: profile.org_id,
      p_reference_id: `doc_upload_${Date.now()}`,
      p_type: "waiver_deduction",
      p_amount: 1,
      p_notes: `Document upload: ${file.name}`,
    });

    const result = Array.isArray(deductResult) ? deductResult[0] : deductResult;
    if (!result?.success) {
      return new Response(JSON.stringify({ error: result?.error_message || "Insufficient credits" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate document ID and upload
    const docId = crypto.randomUUID();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
    const storageKey = `${profile.org_id}/${docId}/${sanitizedName}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from("org-documents")
      .upload(storageKey, fileBuffer, { contentType: file.type, upsert: false });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      return new Response(JSON.stringify({ error: "Failed to upload file" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert document record
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({
        id: docId,
        org_id: profile.org_id,
        user_id: authData.user.id,
        filename: file.name,
        storage_key: storageKey,
        file_size: file.size,
        content_type: file.type,
        source: "user_upload",
      })
      .select()
      .single();

    if (docErr) {
      console.error("Document insert error:", docErr);
      return new Response(JSON.stringify({ error: "Failed to save document record" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ document: doc, new_balance: result.new_balance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("upload-document error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
