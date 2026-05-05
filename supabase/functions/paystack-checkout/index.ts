import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const email = user.email;

    const { amount, productName } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const reference = `ps_${userId}_${Date.now()}`;
    const amountInPesewas = Math.round(amount * 100);

    // Determine callback URL from request origin so Paystack redirects back to /wallet
    const requestOrigin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const origin = requestOrigin || (referer ? new URL(referer).origin : "");
    const callbackUrl = origin
      ? `${origin}/wallet?reference=${encodeURIComponent(reference)}`
      : undefined;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInPesewas,
          currency: "GHS",
          reference,
          label: "LINDE GAS",
          channels: ["mobile_money"],
          ...(callbackUrl ? { callback_url: callbackUrl } : {}),
          metadata: {
            user_id: userId,
            product_name: productName || "Investment",
            is_wallet_deposit: (productName || "").toLowerCase().includes("wallet"),
            display_name: "LINDE GAS",
            custom_fields: [
              {
                display_name: "Business Name",
                variable_name: "business_name",
                value: "LINDE GAS",
              },
              {
                display_name: "Display Name",
                variable_name: "display_name",
                value: "LINDE GAS",
              },
            ],
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: paystackData.message || "Paystack error" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role to insert subscription record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin.from("premium_subscriptions").upsert(
      {
        user_id: userId,
        is_active: false,
        paystack_reference: reference,
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
