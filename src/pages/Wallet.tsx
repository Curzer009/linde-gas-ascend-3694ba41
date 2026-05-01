import { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (data) setBalance(Number(data.balance));
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-checkout", {
        body: { amount: val, productName: "Wallet Deposit" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.authorization_url) throw new Error("No checkout URL returned");

      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ title: "Deposit failed", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const MIN_WITHDRAWAL = 20;

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (val < MIN_WITHDRAWAL) {
      toast({ title: `Minimum withdrawal is ₵${MIN_WITHDRAWAL}`, variant: "destructive" });
      return;
    }
    if (val > balance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-transaction", {
        body: { amount: val, type: "withdrawal" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: `Withdrawal request of ₵${val.toFixed(2)} submitted. Processing within 24hrs.`,
      });
      setAmount("");
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <DashboardNav />
      <div className="pt-24 pb-16 container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Wallet
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-gradient-gold">Balance</span>
          </h1>
        </div>

        {/* Balance Card */}
        <div className="max-w-lg mx-auto mb-10">
          <div className="bg-card rounded-3xl border border-gold/10 p-8 text-center">
            <WalletIcon className="text-gold mx-auto mb-3" size={40} />
            <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
            <p className="text-5xl font-serif font-bold text-gradient-gold">₵{balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto">
          <div className="flex mb-6 bg-card rounded-2xl border border-gold/10 overflow-hidden">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "deposit" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ArrowDownCircle className="inline mr-2" size={18} /> Deposit
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "withdraw" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ArrowUpCircle className="inline mr-2" size={18} /> Withdraw
            </button>
          </div>

          <div className="bg-card rounded-3xl border border-gold/10 p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Amount (₵)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-background border border-gold/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>
            <button
              onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : activeTab === "deposit"
                ? "Recharge"
                : "Request Withdrawal"}
            </button>
            {activeTab === "withdraw" && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-foreground/80 space-y-1">
                <p><span className="font-semibold text-gold">Minimum withdrawal:</span> ₵{MIN_WITHDRAWAL}.00</p>
                <p>A 15% processing fee applies. Requests are reviewed within 24–72 hours (excluding weekends &amp; public holidays).</p>
              </div>
            )}
            <p className="text-muted-foreground text-xs text-center">
              {activeTab === "deposit"
                ? "You'll be redirected to the LEND GAS payment page to complete payment via Mobile Money."
                : "Withdrawals are processed within 24 hours."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
