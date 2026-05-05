import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const REWARD_MAP: Record<number, number> = {
  80: 15,
  150: 20,
  300: 30,
  500: 40,
  900: 45,
};
const getReward = (amt: number) => REWARD_MAP[amt] || 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    const { reference } = await req.json();
    if (!reference || typeof reference !== "string") {
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        },
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return new Response(
        JSON.stringify({ success: false, status: verifyData.data?.status || "failed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tx = verifyData.data;
    const amountInCedis = tx.amount / 100;
    const metaUserId = tx.metadata?.user_id;
    const productName = tx.metadata?.product_name || "Investment";
    const isWalletDeposit =
      tx.metadata?.is_wallet_deposit === true ||
      String(productName).toLowerCase().includes("wallet");

    // Security: ensure the verifying user owns this transaction
    if (metaUserId && metaUserId !== user.id) {
      return new Response(JSON.stringify({ error: "Reference does not belong to user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = metaUserId || user.id;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Mark subscription paid
    await supabaseAdmin
      .from("premium_subscriptions")
      .update({ is_active: true, paid_at: new Date().toISOString() })
      .eq("paystack_reference", reference);

    let credited = false;
    let newBalance: number | null = null;

    if (isWalletDeposit) {
      const { data: depositResult, error: depositError } = await supabaseAdmin.rpc(
        "process_wallet_deposit",
        {
          p_user_id: userId,
          p_amount: amountInCedis,
          p_reference: reference,
          p_notes: "Paystack deposit",
        }
      );

      if (depositError) throw depositError;

      const result = Array.isArray(depositResult) ? depositResult[0] : depositResult;
      credited = Boolean(result?.credited);
      newBalance = result?.balance != null ? Number(result.balance) : null;

      // Process referral reward only once, when this payment newly credits the wallet
      if (credited) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("referred_by")
          .eq("user_id", userId)
          .single();

        if (profile?.referred_by) {
          const reward = getReward(amountInCedis);
          const { data: existingRef } = await supabaseAdmin
            .from("referrals")
            .select("id, status")
            .eq("referred_id", userId)
            .maybeSingle();

          const creditReferrer = async () => {
            const { data: refProfile } = await supabaseAdmin
              .from("profiles")
              .select("balance")
              .eq("user_id", profile.referred_by)
              .single();
            if (refProfile) {
              await supabaseAdmin
                .from("profiles")
                .update({ balance: Number(refProfile.balance) + reward })
                .eq("user_id", profile.referred_by);
            }
          };

          if (existingRef && existingRef.status === "pending") {
            await supabaseAdmin
              .from("referrals")
              .update({ product_name: productName, reward_amount: reward, status: "paid" })
              .eq("id", existingRef.id);
            await creditReferrer();
          } else if (!existingRef) {
            await supabaseAdmin.from("referrals").insert({
              referrer_id: profile.referred_by,
              referred_id: userId,
              product_name: productName,
              reward_amount: reward,
              status: "paid",
            });
            await creditReferrer();
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        credited,
        amount: amountInCedis,
        balance: newBalance,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("paystack-verify error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
