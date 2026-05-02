import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) {
      toast({ title: "Enter your username or email", variant: "destructive" });
      return;
    }
    setLoading(true);

    // If the user typed an email, use it directly. Otherwise treat as username.
    let email = value;
    if (!value.includes("@")) {
      email = `${value.toLowerCase().replace(/[^a-z0-9]/g, "")}@lendgas.app`;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    // Always show success — never leak which accounts exist
    setSent(true);
    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mb-6 text-sm">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
            <Mail className="text-primary-foreground" size={28} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your username or email and we'll send a one-time reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-card rounded-3xl border border-gold/10 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <Mail className="text-gold" size={26} />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">Check your email</h2>
            <p className="text-muted-foreground text-sm">
              If an account matches what you entered, a one-time reset link has been sent.
              The link expires after a short time.
            </p>
            <Link to="/login" className="inline-block mt-2 text-gold font-semibold hover:underline text-sm">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
            <div>
              <label htmlFor="fp-id" className="block text-sm font-medium text-muted-foreground mb-2">
                Username or Email
              </label>
              <input
                id="fp-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or you@example.com"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-muted-foreground text-xs">
              Tip: To receive the email, your account must have a real email on file.
              Add one in your Profile after signing in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
