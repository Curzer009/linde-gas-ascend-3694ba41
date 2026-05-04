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
const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");
const isPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && /^[+\d][\d\s\-()]*$/.test(value);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { identifier, password } = await req.json();
    const rawIdentifier = typeof identifier === "string" ? identifier.trim() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!rawIdentifier || !rawPassword) {
      return json({ error: "Invalid username or password" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);
    const auth = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let email = rawIdentifier.toLowerCase();

    if (!isEmail(rawIdentifier)) {
      let userId: string | null = null;

      if (isPhone(rawIdentifier)) {
        const phone = normalizePhone(rawIdentifier);
        const { data: profile } = await admin
          .from("profiles")
          .select("user_id")
          .eq("phone", phone)
          .maybeSingle();
        if (profile?.user_id) userId = profile.user_id;
      }

      if (!userId) {
        const username = normalizeUsername(rawIdentifier);
        if (!username) return json({ error: "Invalid username or password" }, 400);

        const { data: profile, error: profileError } = await admin
          .from("profiles")
          .select("user_id")
          .eq("username", username)
          .maybeSingle();

        if (profileError || !profile?.user_id) {
          return json({ error: "Invalid username or password" }, 400);
        }
        userId = profile.user_id;
      }

      const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
      if (userError || !userData.user?.email) {
        return json({ error: "Invalid username or password" }, 400);
      }

      email = userData.user.email;
    }

    const { data, error } = await auth.auth.signInWithPassword({ email, password: rawPassword });
    if (error || !data.session) {
      return json({ error: "Invalid username or password" }, 400);
    }

    return json({ session: data.session });
  } catch {
    return json({ error: "Invalid username or password" }, 400);
  }
});
