import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  useEffect(() => {
    if (!refCode) return;
    const lookup = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("referral_code", refCode)
        .single();
      if (data) setReferrerName(data.full_name);
    };
    lookup();
  }, [refCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@lindegas.app`;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.includes("already registered")) {
        toast({ title: "This username is already taken. Try signing in.", variant: "destructive" });
      } else {
        toast({ title: error.message, variant: "destructive" });
      }
      return;
    }

    // Handle referral if ref code present
    if (refCode && signUpData.user) {
      try {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("referral_code", refCode)
          .single();

        if (referrer) {
          await supabase
            .from("profiles")
            .update({ referred_by: referrer.user_id })
            .eq("user_id", signUpData.user.id);

          await supabase.from("referrals").insert({
            referrer_id: referrer.user_id,
            referred_id: signUpData.user.id,
            reward_amount: 0,
            status: "pending",
          });
        }
      } catch {
        // Referral tracking is non-critical
      }
    }

    setLoading(false);
    toast({ title: "Account created successfully!" });
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/page-bg.png" alt="LINDE GAS logo" className="w-16 h-16 rounded-full object-cover border border-gold/30 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join LINDE GAS and start earning today</p>
          {referrerName && (
            <p className="text-gold text-sm mt-2">Referred by: {referrerName}</p>
          )}
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
          <div>
            <label htmlFor="signup-fullname" className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
            <input
              id="signup-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              maxLength={128}
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-gold font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
