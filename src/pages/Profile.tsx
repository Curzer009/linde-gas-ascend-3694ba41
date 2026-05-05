import { useState, useEffect } from "react";
import { User, Mail, Calendar, Phone, Save } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, username, balance, bonus_balance, created_at, phone")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            setPhone(data.phone || "");
          }
        });
      setEmail(user.email && !user.email.endsWith("@lindegas.app") ? user.email : "");
    }
  }, [user]);

  const savePhone = async () => {
    if (!user) return;
    const cleaned = phone.trim();
    if (cleaned && !/^\+?[0-9 ()-]{7,20}$/.test(cleaned)) {
      toast({ title: "Invalid phone number", variant: "destructive" });
      return;
    }
    setSavingPhone(true);
    const { error } = await supabase.from("profiles").update({ phone: cleaned || null }).eq("user_id", user.id);
    setSavingPhone(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Phone number saved" });
    }
  };

  const saveEmail = async () => {
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email: cleaned },
      { emailRedirectTo: `${window.location.origin}/profile` }
    );
    setSavingEmail(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verification email sent. Click the link to confirm." });
    }
  };

  const hasRealEmail = user?.email && !user.email.endsWith("@lindegas.app");

  return (
    <div className="min-h-screen bg-transparent">
      <DashboardNav />
      <div className="pt-24 pb-16 container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Profile
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-gradient-gold">Account</span>
          </h1>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Avatar & Name */}
          <div className="bg-card rounded-3xl border border-gold/10 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <User className="text-primary-foreground" size={36} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">{profile?.full_name || "Loading..."}</h2>
            <p className="text-gold text-sm font-semibold">@{profile?.username || "..."}</p>
          </div>

          {/* Details */}
          <div className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
            <div className="flex items-center gap-4">
              <User className="text-gold" size={20} />
              <div>
                <p className="text-muted-foreground text-xs">Full Name</p>
                <p className="text-foreground font-semibold">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="text-gold" size={20} />
              <div>
                <p className="text-muted-foreground text-xs">Member Since</p>
                <p className="text-foreground font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "..."}
                </p>
              </div>
            </div>
            <div className="h-px bg-gold/10" />
            <div className="flex items-center gap-4">
              <div className="text-gold text-sm">💰</div>
              <div>
                <p className="text-muted-foreground text-xs">Available Balance</p>
                <p className="text-gold font-bold text-lg">₵{Number(profile?.balance || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-gold text-sm">🎁</div>
              <div>
                <p className="text-muted-foreground text-xs">Bonus Balance</p>
                <p className="text-gold font-bold text-lg">₵{Number((profile as any)?.bonus_balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Recovery info */}
          <div className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Account Recovery</h3>
              <p className="text-muted-foreground text-xs mt-1">
                Add an email and phone number so you can reset your password if you lose access.
              </p>
            </div>

            <div>
              <label className="text-muted-foreground text-xs flex items-center gap-2 mb-2">
                <Mail size={14} className="text-gold" /> Recovery Email
                {hasRealEmail && <span className="text-gold text-[10px] uppercase tracking-wider">verified</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
                />
                <button
                  onClick={saveEmail}
                  disabled={savingEmail}
                  className="px-4 rounded-lg bg-gradient-gold text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-xs flex items-center gap-2 mb-2">
                <Phone size={14} className="text-gold" /> Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 ..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
                />
                <button
                  onClick={savePhone}
                  disabled={savingPhone}
                  className="px-4 rounded-lg bg-gradient-gold text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Save size={14} /> Save
                </button>
              </div>
              <p className="text-muted-foreground/70 text-[11px] mt-2">
                SMS one-time codes will be available soon. Add your number now to be ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
