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

interface ClaimCode {
  id: string;
  code: string;
  amount: number;
  note: string | null;
  claimed_at: string | null;
  created_at: string;
}

const Referrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [claimInput, setClaimInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [myCodes, setMyCodes] = useState<ClaimCode[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);

  const fetchData = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code, balance")
      .eq("user_id", user.id)
      .single();

    if (profile?.referral_code) setReferralCode(profile.referral_code);
    if (profile) setAvailableBalance(Number((profile as any).balance || 0));

    const { data: refs } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (refs) {
      setReferrals(refs);
      setTotalEarned(refs.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.reward_amount), 0));
    }

    const { data: codes } = await supabase
      .from("referral_reward_codes" as any)
      .select("id, code, amount, note, claimed_at, created_at")
      .order("created_at", { ascending: false });
    if (codes) setMyCodes(codes as unknown as ClaimCode[]);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleClaim = async () => {
    const code = claimInput.trim();
    if (!code) {
      toast({ title: "Claim code is required.", variant: "destructive" });
      return;
    }
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_referral_code" as any, { p_code: code });
    setClaiming(false);
    if (error) {
      toast({ title: "Claim failed", description: error.message, variant: "destructive" });
      return;
    }
    const row = Array.isArray(data) ? (data[0] as any) : (data as any);
    toast({
      title: `₵${Number(row?.amount || 0).toFixed(2)} added to your available balance`,
      description: "You can withdraw this prize from your wallet.",
    });
    setClaimInput("");
    fetchData();
  };

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

        {/* Claim Prize */}
        <div className="bg-card rounded-2xl border border-gold/10 p-6 mb-8">
          <h2 className="font-serif text-lg font-bold text-foreground mb-1">Claim Your Prize</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Enter the unique claim code issued to you by an administrator. Each code works once and pays
            straight into your available balance (₵{availableBalance.toFixed(2)}), ready for withdrawal.
          </p>
          <div className="flex gap-2">
            <input
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value.toUpperCase())}
              placeholder="REF-XXXXXXXX"
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground text-sm tracking-widest uppercase placeholder:text-muted-foreground focus:outline-none focus:border-gold/30"
            />
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-5 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {claiming ? "Claiming..." : "Claim"}
            </button>
          </div>

          {myCodes.length > 0 && (
            <div className="mt-5 space-y-2">
              {myCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-gold/5 bg-background/40 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-foreground tracking-wider">{c.code}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.note || "Referral prize"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gold font-bold text-sm">₵{Number(c.amount).toFixed(2)}</p>
                    <p className={`text-xs ${c.claimed_at ? "text-green-500" : "text-amber-500"}`}>
                      {c.claimed_at ? "Claimed" : "Unclaimed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
