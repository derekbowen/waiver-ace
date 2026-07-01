import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reason, details, credits_requested } = await req.json();

    // Validate inputs
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Reason is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amount = Math.min(Math.max(Math.floor(Number(credits_requested) || 0), 1), 50);

    const admin = createClient(supabaseUrl, serviceKey);

    // Atomic: locks wallet row, checks 2-dispute cap, inserts dispute + grants credits
    // in a single SECURITY DEFINER function so concurrent requests cannot bypass the cap.
    const { data: result, error: rpcError } = await admin.rpc("process_credit_dispute_atomic", {
      p_user_id: user.id,
      p_reason: reason.trim(),
      p_details: details ? String(details) : null,
      p_credits_requested: amount,
    });

    if (rpcError || !result) {
      console.error("process_credit_dispute_atomic error:", rpcError);
      return new Response(JSON.stringify({ error: "Failed to process dispute. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!(result as any).success) {
      const err = (result as any).error;
      if (err === "limit_reached") {
        return new Response(
          JSON.stringify({
            error: "You've already used your 2 automatic reimbursements. Please contact support for further assistance.",
            limit_reached: true,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: err || "Failed to process dispute" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        credits_granted: (result as any).credits_granted,
        new_balance: (result as any).new_balance,
        remaining_disputes: (result as any).remaining_disputes,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-credit-dispute error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
