import { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon, Copy } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AGENT_NUMBER = "0539013373";
const AGENT_NAME = "Akwaa Owusu";
const AGENT_PROVIDER = "MTN";

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [showDepositInfo, setShowDepositInfo] = useState(false);

  const fetchBalance = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setBalance(Number(data.balance));
      return Number(data.balance);
    }
    return null;
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const handleTransaction = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (activeTab === "withdraw" && val > balance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "deposit") {
        const { data, error } = await supabase.functions.invoke("create-transaction", {
          body: { amount: val, type: "deposit", notes: `MoMo to ${AGENT_NUMBER} (${AGENT_NAME})` },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setShowDepositInfo(true);
        toast({
          title: `Deposit request of ₵${val.toFixed(2)} created`,
          description: "Send the amount to the agent below. Balance updates after admin confirms.",
        });
        setAmount("");
        return;
      }

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
    <div className="min-h-screen bg-background">
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
              onClick={handleTransaction}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Processing..." : activeTab === "deposit" ? "Request Deposit" : "Request Withdrawal"}
            </button>

            <p className="text-muted-foreground text-xs text-center">
              {activeTab === "deposit"
                ? "Send your deposit via Mobile Money to the agent details shown below. Your balance updates once the admin confirms payment."
                : "Withdrawals are processed within 24 hours."}
            </p>
          </div>

          {activeTab === "deposit" && (
            <>
              <div className="mt-6 bg-card rounded-3xl border border-gold/20 p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-gradient-gold text-center">
                  Send Mobile Money To
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-gold/10">
                    <div>
                      <p className="text-xs text-muted-foreground">Agent Number</p>
                      <p className="text-foreground font-bold tracking-wider">{AGENT_NUMBER}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(AGENT_NUMBER, "Number")}
                      className="p-2 rounded-lg hover:bg-gold/10 text-gold transition-colors"
                      aria-label="Copy number"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-gold/10">
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="text-foreground font-semibold">{AGENT_NAME}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-gold/10">
                    <p className="text-xs text-muted-foreground">Network</p>
                    <p className="text-foreground font-semibold">{AGENT_PROVIDER}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  After sending, click <span className="text-gold font-semibold">Request Deposit</span> above so the admin can confirm and credit your wallet.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
                <p className="text-destructive text-xs text-center font-medium">
                  ⚠ Telecel transactions are currently down and will be updated soon.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
