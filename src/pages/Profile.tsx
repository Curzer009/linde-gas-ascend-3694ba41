import { useState, useEffect } from "react";
import { User, Mail, Calendar, MessageCircle } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import SupportBot from "@/components/SupportBot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; username: string; balance: number; created_at: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, username, balance, created_at")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data as any);
        });
    }
  }, [user]);

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
              <Mail className="text-gold" size={20} />
              <div>
                <p className="text-muted-foreground text-xs">Username</p>
                <p className="text-foreground font-semibold">@{profile?.username}</p>
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
                <p className="text-muted-foreground text-xs">Balance</p>
                <p className="text-gold font-bold text-lg">₵{Number(profile?.balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Support Bot */}
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-3 flex items-center gap-2 px-1">
              <MessageCircle className="text-gold" size={20} /> Support
            </h3>
            <SupportBot variant="inline" />
            <a
              href="https://t.me/lendgassupport"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-4 py-3 rounded-xl border border-gold/20 text-foreground font-semibold text-center hover:bg-gold/5 transition-colors"
            >
              Or contact us @lendgassupport on Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
