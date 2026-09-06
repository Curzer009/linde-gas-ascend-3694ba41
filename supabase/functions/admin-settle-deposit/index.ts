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

const MIN_CONFIRMATIONS = 1;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Not authorized" }, 403);

    const body = await req.json().catch(() => ({}));
    const transactionId = String(body?.transaction_id || "");
    const approve = body?.approve !== false;
    const reason = body?.reason ? String(body.reason).slice(0, 500) : null;
    if (!transactionId) return json({ error: "Missing transaction id" }, 400);

    const { data: tx, error: txError } = await admin
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();
    if (txError || !tx) return json({ error: "Transaction not found" }, 404);
    if (tx.type !== "deposit") return json({ error: "Not a deposit" }, 400);

    if (!approve) {
      const { error } = await admin.rpc("admin_reject_deposit", {
        p_admin_id: user.id,
        p_transaction_id: transactionId,
        p_reason: reason ?? "Rejected by admin",
      });
      if (error) return json({ error: error.message }, 400);
      return json({ status: "rejected" });
    }

    // ---- Approval path: independent verification is mandatory ----
    const txid = typeof tx.txid === "string" ? tx.txid.trim() : "";
    if (!txid) return json({ error: "Transaction ID is required." }, 400);

    if (tx.status === "completed" || tx.status === "approved") {
      return json({ status: "already_approved", credited: false });
    }
    if (tx.status !== "pending") {
      return json({ error: "Deposit already settled" }, 400);
    }

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      return json({ error: "Transaction could not be verified." }, 500);
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(txid)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } }
    );

    if (res.status === 404) {
      return json({ error: "Transaction could not be verified." }, 400);
    }
    if (!res.ok) {
      return json({ error: "Transaction could not be verified." }, 400);
    }

    const payload = await res.json().catch(() => null);
    const data = payload?.data;
    if (!payload?.status || !data) {
      return json({ error: "Transaction could not be verified." }, 400);
    }

    // 1. Successful / confirmed
    if (String(data.status).toLowerCase() !== "success") {
      if (String(data.status).toLowerCase() === "pending" || String(data.status).toLowerCase() === "ongoing") {
        return json({ error: "Transaction has not received enough confirmations." }, 400);
      }
      return json({ error: "Transaction could not be verified." }, 400);
    }

    // 2. Amount matches the submitted deposit (Paystack amounts are in pesewas)
    const paidAmount = Number(data.amount || 0) / 100;
    if (Math.abs(paidAmount - Number(tx.amount)) > 0.009) {
      return json({ error: "Transaction amount does not match the deposit." }, 400);
    }

    // 3. Currency / network matches
    const txCurrency = String(tx.currency || "GHS").toUpperCase();
    if (String(data.currency || "").toUpperCase() !== txCurrency) {
      return json({ error: "Transaction currency does not match the deposit." }, 400);
    }

    // 4. Paid to / from the correct account, when the provider reports one
    const reportedAccount = String(
      data.authorization?.mobile_money_number ||
        data.authorization?.last4 ||
        data.customer?.phone ||
        ""
    ).replace(/\D/g, "");
    const expectedAccount = String(tx.deposit_account || "").replace(/\D/g, "");
    if (expectedAccount && reportedAccount && reportedAccount.length >= 4) {
      const a = expectedAccount.slice(-4);
      const b = reportedAccount.slice(-4);
      if (a !== b) {
        return json({ error: "Transaction was not sent to the correct account." }, 400);
      }
    }

    // 5. Confirmations, where the provider exposes them
    const confirmations = Number(data.confirmations ?? MIN_CONFIRMATIONS);
    if (isFinite(confirmations) && confirmations < MIN_CONFIRMATIONS) {
      return json({ error: "Transaction has not received enough confirmations." }, 400);
    }

    const verification = {
      verified: true,
      provider: "paystack",
      txid,
      reference: data.reference,
      provider_status: data.status,
      amount: paidAmount,
      currency: data.currency,
      channel: data.channel,
      paid_at: data.paid_at,
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    };

    const { data: result, error: rpcError } = await admin.rpc("admin_approve_deposit", {
      p_admin_id: user.id,
      p_transaction_id: transactionId,
      p_verification: verification,
    });
    if (rpcError) return json({ error: rpcError.message }, 400);

    const row = Array.isArray(result) ? result[0] : result;
    return json({
      status: "approved",
      credited: row?.credited ?? false,
      bonus_balance: row?.bonus_balance ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
