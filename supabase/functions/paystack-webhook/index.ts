import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const REWARD_MAP: Record<number, number> = {
  80: 15,
  150: 20,
  300: 30,
  500: 40,
  900: 45,
};

function getReward(amountInCedis: number): number {
  return REWARD_MAP[amountInCedis] || 15;
}

async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    if (!signature || !(await verifySignature(body, signature, secret))) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const amountInPesewas = event.data.amount;
      const amountInCedis = amountInPesewas / 100;
      const productName = event.data.metadata?.product_name || "Investment";
      const userId = event.data.metadata?.user_id;

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const isWalletDeposit =
        event.data.metadata?.is_wallet_deposit === true ||
        String(event.data.metadata?.product_name || "")
          .toLowerCase()
          .includes("wallet");

      // Update subscription
      const { error } = await supabase
        .from("premium_subscriptions")
        .update({ is_active: true, paid_at: new Date().toISOString() })
        .eq("paystack_reference", reference);

      if (error) {
        console.error("Failed to update subscription:", error);
      }

      // Credit wallet for deposits (idempotent via reference)
      if (isWalletDeposit && userId) {
        const { data: existingTxn } = await supabase
          .from("transactions")
          .select("id")
          .eq("reference", reference)
          .maybeSingle();

        if (!existingTxn) {
          const { error: txnErr } = await supabase.from("transactions").insert({
            user_id: userId,
            amount: amountInCedis,
            type: "deposit",
            status: "completed",
            reference,
            notes: "Paystack deposit",
          });

          if (txnErr) {
            console.error("Failed to log deposit txn:", txnErr);
          } else {
            const { data: depProfile } = await supabase
              .from("profiles")
              .select("balance")
              .eq("user_id", userId)
              .single();
            if (depProfile) {
              await supabase
                .from("profiles")
                .update({ balance: Number(depProfile.balance) + amountInCedis })
                .eq("user_id", userId);
            }
          }
        }
      }

      // Process referral reward
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("user_id", userId)
          .single();

        if (profile?.referred_by) {
          const reward = getReward(amountInCedis);

          // Check if referral already exists for this user
          const { data: existingRef } = await supabase
            .from("referrals")
            .select("id, status")
            .eq("referred_id", userId)
            .single();

          if (existingRef && existingRef.status === "pending") {
            // Update the referral with product info and mark as paid
            await supabase
              .from("referrals")
              .update({
                product_name: productName,
                reward_amount: reward,
                status: "paid",
              })
              .eq("id", existingRef.id);

            // Credit the referrer's balance
            const { data: referrerProfile } = await supabase
              .from("profiles")
              .select("balance")
              .eq("user_id", profile.referred_by)
              .single();

            if (referrerProfile) {
              await supabase
                .from("profiles")
                .update({ balance: Number(referrerProfile.balance) + reward })
                .eq("user_id", profile.referred_by);
            }
          } else if (!existingRef) {
            // Create a new paid referral
            await supabase.from("referrals").insert({
              referrer_id: profile.referred_by,
              referred_id: userId,
              product_name: productName,
              reward_amount: reward,
              status: "paid",
            });

            // Credit the referrer's balance
            const { data: referrerProfile } = await supabase
              .from("profiles")
              .select("balance")
              .eq("user_id", profile.referred_by)
              .single();

            if (referrerProfile) {
              await supabase
                .from("profiles")
                .update({ balance: Number(referrerProfile.balance) + reward })
                .eq("user_id", profile.referred_by);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
});
