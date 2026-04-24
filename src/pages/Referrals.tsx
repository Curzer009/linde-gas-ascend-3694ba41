import { useEffect, useState } from "react";
import { Copy, Check, Users, Gift, Share2 } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  referred_id: string;
  product_name: string | null;
  reward_amount: number;
  status: string;
  created_at: string;
}

const REWARD_MAP: Record<number, number> = {
  80: 15,
  150: 20,
  300: 30,
  500: 40,
  900: 45,
};

const Referrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();

      if (profile?.referral_code) setReferralCode(profile.referral_code);

      const { data: refs } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (refs) {
        setReferrals(refs);
        setTotalEarned(refs.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.reward_amount), 0));
      }
    };

    fetchData();
  }, [user]);

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <DashboardNav />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Referral Program
          </span>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            Invite Friends, <span className="text-gradient-gold">Earn Rewards</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Share your referral link and earn ₵15 – ₵45 when your friend buys a product.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-gold/10 p-6 text-center">
            <Users className="mx-auto text-gold mb-2" size={28} />
            <div className="text-3xl font-serif font-bold text-foreground">{referrals.length}</div>
            <div className="text-muted-foreground text-sm">Total Referrals</div>
          </div>
          <div className="bg-card rounded-2xl border border-gold/10 p-6 text-center">
            <Gift className="mx-auto text-gold mb-2" size={28} />
            <div className="text-3xl font-serif font-bold text-gradient-gold">₵{totalEarned.toFixed(2)}</div>
            <div className="text-muted-foreground text-sm">Total Earned</div>
          </div>
          <div className="bg-card rounded-2xl border border-gold/10 p-6 text-center">
            <Share2 className="mx-auto text-gold mb-2" size={28} />
            <div className="text-3xl font-serif font-bold text-foreground">
              {referrals.filter(r => r.status === "pending").length}
            </div>
            <div className="text-muted-foreground text-sm">Pending Rewards</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-card rounded-2xl border border-gold/10 p-6 mb-8">
          <h2 className="font-serif text-lg font-bold text-foreground mb-3">Your Referral Link</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground text-sm truncate"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="bg-card rounded-2xl border border-gold/10 p-6 mb-8">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">Reward Tiers</h2>
          <div className="space-y-3">
            {Object.entries(REWARD_MAP).map(([price, reward]) => (
              <div key={price} className="flex justify-between items-center py-2 border-b border-gold/5 last:border-0">
                <span className="text-muted-foreground text-sm">Friend buys ₵{price} product</span>
                <span className="text-gold font-bold">+₵{reward} reward</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        {referrals.length > 0 && (
          <div className="bg-card rounded-2xl border border-gold/10 p-6">
            <h2 className="font-serif text-lg font-bold text-foreground mb-4">Referral History</h2>
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex justify-between items-center py-3 border-b border-gold/5 last:border-0">
                  <div>
                    <div className="text-foreground text-sm font-medium">{ref.product_name || "Signed up"}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${ref.status === "paid" ? "text-gold" : "text-muted-foreground"}`}>
                      +₵{Number(ref.reward_amount).toFixed(2)}
                    </div>
                    <div className={`text-xs ${ref.status === "paid" ? "text-green-500" : "text-amber-500"}`}>
                      {ref.status === "paid" ? "Credited" : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
