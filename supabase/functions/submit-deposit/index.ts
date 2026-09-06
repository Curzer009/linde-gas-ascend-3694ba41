import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
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
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const txidRaw = body?.txid;
    const txid = typeof txidRaw === "string" ? txidRaw.trim() : "";

    // Server-side guard: TXID is mandatory and cannot be whitespace only.
    if (!txid) return json({ error: "Transaction ID is required." }, 400);
    if (txid.length < 4 || txid.length > 120) {
      return json({ error: "Transaction ID is not valid." }, 400);
    }

    const amount = Number(body?.amount);
    if (!amount || !isFinite(amount) || amount <= 0 || amount > 100000) {
      return json({ error: "Invalid amount" }, 400);
    }

    const currency = String(body?.currency || "GHS").toUpperCase().slice(0, 10);
    const depositAccount = body?.deposit_account
      ? String(body.deposit_account).trim().slice(0, 120)
      : null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("is_suspended")
      .eq("user_id", user.id)
      .single();
    if (profile?.is_suspended) {
      return json({ error: "Your account is suspended." }, 403);
    }

    const { data, error } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        amount,
        type: "deposit",
        status: "pending",
        txid,
        currency,
        deposit_account: depositAccount,
        reference: txid,
        notes: "Deposit awaiting Transaction ID verification",
      })
      .select("id, amount, status, txid, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return json({ error: "Transaction ID has already been used." }, 409);
      }
      return json({ error: error.message }, 400);
    }

    return json({ deposit: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
