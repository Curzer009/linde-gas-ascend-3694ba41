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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, type, notes } = await req.json();

    // Validate type
    if (!["deposit", "withdrawal", "purchase"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid transaction type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0 || parsedAmount > 100000) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Withdrawals come strictly from the available (withdrawable) balance.
    // Purchases come strictly from the bonus balance.
    if (type === "withdrawal" || type === "purchase") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("balance, bonus_balance")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (type === "withdrawal") {
        if (Number(profile.balance) < parsedAmount) {
          return new Response(
            JSON.stringify({ error: "Insufficient available balance" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (type === "purchase") {
        if (Number(profile.bonus_balance) < parsedAmount) {
          return new Response(
            JSON.stringify({ error: "Insufficient bonus balance. Please recharge your bonus wallet." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const newBonus = Number(profile.bonus_balance) - parsedAmount;
        const { error: updErr } = await supabaseAdmin
          .from("profiles")
          .update({ bonus_balance: newBonus })
          .eq("user_id", user.id);
        if (updErr) {
          return new Response(JSON.stringify({ error: updErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { data, error } = await supabaseAdmin.from("transactions").insert({
      user_id: user.id,
      amount: parsedAmount,
      type,
      status: type === "purchase" ? "completed" : "pending",
      notes: notes ? String(notes).slice(0, 500) : null,
      reference: `txn_${user.id.slice(0, 8)}_${Date.now()}`,
    }).select().single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ transaction: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
