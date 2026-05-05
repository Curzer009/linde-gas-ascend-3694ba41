import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon, Loader2, ReceiptText } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "transactions">("deposit");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    reference: string | null;
    created_at: string;
  }>>([]);

  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("balance, bonus_balance")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setBalance(Number(data.balance));
      setBonusBalance(Number((data as any).bonus_balance ?? 0));
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setTransactionsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, type, status, reference, created_at")
      .eq("user_id", user.id)
      .in("type", ["deposit", "withdrawal", "admin_credit", "bonus_credit", "purchase"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setTransactions(
        data.map((tx) => ({
          ...tx,
          amount: Number(tx.amount),
        }))
      );
    }
    setTransactionsLoading(false);
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [user]);

  // Handle Paystack redirect: verify the payment and credit wallet immediately
  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (!reference || !user) return;

    let cancelled = false;
    setVerifying(true);

    const verify = async () => {
      let credited = false;
      let lastAmount: number | null = null;

      // Poll up to 6 times (covers race with webhook + Paystack confirmation)
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "paystack-verify",
            { body: { reference } }
          );
          if (error) throw error;
          if (data?.success) {
            credited = data.credited;
            lastAmount = data.amount ?? null;
            if (typeof data.balance === "number") setBalance(data.balance);
            if (credited) break;
          }
        } catch (e) {
          console.error("verify attempt failed", e);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (cancelled) return;

      await fetchBalance();
      await fetchTransactions();
      setVerifying(false);

      // Clean the URL
      searchParams.delete("reference");
      searchParams.delete("trxref");
      setSearchParams(searchParams, { replace: true });

      if (credited) {
        toast({
          title: "Payment successful",
          description:
            lastAmount != null
              ? `₵${lastAmount.toFixed(2)} added to your wallet.`
              : "Your wallet has been credited.",
        });
      } else {
        toast({
          title: "Payment processing",
          description:
            "We couldn't confirm your payment yet. Your balance will update shortly.",
        });
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams.get("reference"), searchParams.get("trxref")]);


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
      fetchTransactions();
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
            {verifying && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gold">
                <Loader2 className="animate-spin" size={16} />
                Confirming your payment…
              </div>
            )}
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
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "transactions" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ReceiptText className="inline mr-2" size={18} /> History
            </button>
          </div>

          {activeTab !== "transactions" ? (
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
                ? "You'll be redirected to the LINDE GAS payment page to complete payment via Mobile Money."
                : "Withdrawals are processed within 24 hours."}
            </p>
          </div>
          ) : (
          <div className="bg-card rounded-3xl border border-gold/10 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">Recent Transactions</h2>
              {transactionsLoading && <Loader2 className="text-gold animate-spin" size={18} />}
            </div>

            {transactions.length === 0 && !transactionsLoading ? (
              <div className="rounded-2xl border border-gold/10 bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                No deposits or withdrawals yet.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === "deposit";
                  const created = new Date(tx.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={tx.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gold/10 bg-background/40 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {isDeposit ? (
                          <ArrowDownCircle className="shrink-0 text-gold" size={22} />
                        ) : (
                          <ArrowUpCircle className="shrink-0 text-muted-foreground" size={22} />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">{created}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isDeposit ? "text-gold" : "text-foreground"}`}>
                          {isDeposit ? "+" : "-"}₵{tx.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
