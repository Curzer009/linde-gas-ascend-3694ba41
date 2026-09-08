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

    const { amount, type, notes, phone_number, network_provider } = await req.json();

    // Validate withdrawal-specific fields
    if (type === "withdrawal") {
      const phoneOk = typeof phone_number === "string" && /^[0-9+\-\s]{9,15}$/.test(phone_number.trim());
      const providerOk = ["MTN", "TELECEL", "AIRTELTIGO"].includes(String(network_provider || "").toUpperCase());
      if (!phoneOk || !providerOk) {
        return new Response(
          JSON.stringify({ error: "Valid phone number and network provider (MTN, TELECEL, AIRTELTIGO) are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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
        .select("balance, bonus_balance, is_suspended")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (profile.is_suspended) {
        return new Response(
          JSON.stringify({ error: "Your account is suspended. Please contact support." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (type === "withdrawal") {
        if (parsedAmount < 20) {
          return new Response(
            JSON.stringify({ error: "Minimum withdrawal is ₵20" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (Number(profile.balance) < parsedAmount) {
          return new Response(
            JSON.stringify({ error: "Insufficient available balance" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Hold the funds immediately so the available balance reflects the request.
        const { error: holdErr } = await supabaseAdmin
          .from("profiles")
          .update({ balance: Number(profile.balance) - parsedAmount })
          .eq("user_id", user.id)
          .gte("balance", parsedAmount);
        if (holdErr) {
          return new Response(JSON.stringify({ error: holdErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
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
      phone_number: type === "withdrawal" ? String(phone_number).trim() : null,
      network_provider: type === "withdrawal" ? String(network_provider).toUpperCase() : null,
    }).select().single();

    if (error) {
      // Roll back the held funds if the request row could not be created.
      if (type === "withdrawal") {
        const { data: p } = await supabaseAdmin
          .from("profiles")
          .select("balance")
          .eq("user_id", user.id)
          .single();
        if (p) {
          await supabaseAdmin
            .from("profiles")
            .update({ balance: Number(p.balance) + parsedAmount })
            .eq("user_id", user.id);
        }
      }
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
