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
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) return json({ error: "Not authorized" }, 403);

    const body = await req.json().catch(() => ({}));
    const targetId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
    if (!targetId) return json({ error: "user_id is required" }, 400);
    if (targetId === user.id) return json({ error: "You cannot delete your own admin account." }, 400);

    const { data: targetIsAdmin } = await admin.rpc("has_role", {
      _user_id: targetId,
      _role: "admin",
    });
    if (targetIsAdmin) return json({ error: "Another administrator cannot be deleted here." }, 400);

    // Clean up owned rows first (no cascade on these tables)
    await admin.from("support_tickets").delete().eq("user_id", targetId);
    await admin.from("transactions").delete().eq("user_id", targetId);
    await admin.from("premium_subscriptions").delete().eq("user_id", targetId);
    await admin.from("referrals").delete().or(`referrer_id.eq.${targetId},referred_id.eq.${targetId}`);
    await admin.from("profiles").delete().eq("user_id", targetId);

    const { error: delError } = await admin.auth.admin.deleteUser(targetId);
    if (delError) return json({ error: delError.message }, 400);

    await admin.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "delete_user",
      target_user_id: targetId,
      details: { deleted_at: new Date().toISOString() },
    });

    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
