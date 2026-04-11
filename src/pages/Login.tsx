import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@lindegas.app`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({ title: "Invalid username or password", variant: "destructive" });
      return;
    }

    toast({ title: "Welcome back!" });
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-serif font-bold text-2xl">L</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your LINDE GAS account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-gold font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
