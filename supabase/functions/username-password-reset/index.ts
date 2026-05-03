import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: true });

  try {
    const { identifier, redirectTo } = await req.json();
    const rawIdentifier = typeof identifier === "string" ? identifier.trim() : "";
    const redirect = typeof redirectTo === "string" ? redirectTo : undefined;

    if (!rawIdentifier) return json({ ok: true });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);
    const auth = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let email = rawIdentifier.toLowerCase();

    if (!isEmail(rawIdentifier)) {
      const username = normalizeUsername(rawIdentifier);
      if (!username) return json({ ok: true });

      const { data: profile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("username", username)
        .maybeSingle();

      if (!profile?.user_id) return json({ ok: true });

      const { data: userData } = await admin.auth.admin.getUserById(profile.user_id);
      if (!userData.user?.email) return json({ ok: true });

      email = userData.user.email;
    }

    await auth.auth.resetPasswordForEmail(email, { redirectTo: redirect });
    return json({ ok: true });
  } catch {
    return json({ ok: true });
  }
});
