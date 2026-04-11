import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    // Use username as email placeholder for auth (username@lindegas.app)
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@lindegas.app`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({ title: "This username is already taken. Try signing in.", variant: "destructive" });
      } else {
        toast({ title: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Account created successfully!" });
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-serif font-bold text-2xl">L</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join LINDE GAS and start earning today</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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
