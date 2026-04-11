
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Package, CreditCard, Settings, LogOut, Shield,
  Ban, CheckCircle, Edit, Trash2, Plus, Save, X
} from "lucide-react";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  balance: number;
  is_suspended: boolean;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  icon_name: string;
  color: string;
  is_active: boolean;
  reign_days: number;
};

type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

type PaymentMethod = {
  id: string;
  name: string;
  details: string;
  is_active: boolean;
};

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("members");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profilesRes, productsRes, transactionsRes, paymentRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("price"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_methods").select("*"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    if (transactionsRes.data) setTransactions(transactionsRes.data as Transaction[]);
    if (paymentRes.data) setPaymentMethods(paymentRes.data as PaymentMethod[]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  // Member management
  const toggleSuspend = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: !profile.is_suspended })
      .eq("id", profile.id);
    if (error) {
      toast({ title: "Error updating user", variant: "destructive" });
    } else {
      toast({ title: profile.is_suspended ? "User unsuspended" : "User suspended" });
      loadData();
    }
  };

  const saveProfile = async () => {
    if (!editingProfile) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editingProfile.full_name,
        username: editingProfile.username,
        balance: editingProfile.balance,
      })
      .eq("id", editingProfile.id);
    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      setEditingProfile(null);
      loadData();
    }
  };

  // Product management
  const saveProduct = async () => {
    if (!editingProduct) return;
    const { error } = await supabase
      .from("products")
      .update({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
        reign_days: editingProduct.reign_days,
        is_active: editingProduct.is_active,
      })
      .eq("id", editingProduct.id);
    if (error) {
      toast({ title: "Error saving product", variant: "destructive" });
    } else {
      toast({ title: "Product updated" });
      setEditingProduct(null);
      loadData();
    }
  };

  // Transaction management
  const updateTransactionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error updating", variant: "destructive" });
    } else {
      toast({ title: `Transaction ${status}` });
      loadData();
    }
  };

  // Payment method management
  const savePaymentMethod = async () => {
    if (!editingPayment) return;
    if (editingPayment.id === "new") {
      const { error } = await supabase
        .from("payment_methods")
        .insert({ name: editingPayment.name, details: editingPayment.details });
      if (error) {
        toast({ title: "Error adding", variant: "destructive" });
      } else {
        toast({ title: "Payment method added" });
        setEditingPayment(null);
        loadData();
      }
    } else {
      const { error } = await supabase
        .from("payment_methods")
        .update({ name: editingPayment.name, details: editingPayment.details, is_active: editingPayment.is_active })
        .eq("id", editingPayment.id);
      if (error) {
        toast({ title: "Error saving", variant: "destructive" });
      } else {
        toast({ title: "Payment method updated" });
        setEditingPayment(null);
        loadData();
      }
    }
  };

  const tabs = [
    { id: "members", label: "Members", icon: Users },
    { id: "transactions", label: "Deposits", icon: CreditCard },
    { id: "products", label: "Products", icon: Package },
    { id: "payments", label: "Payment Methods", icon: Settings },
  ];

  const stats = {
    totalMembers: profiles.length,
    totalDeposits: transactions.filter((t) => t.type === "deposit").length,
    pendingDeposits: transactions.filter((t) => t.type === "deposit" && t.status === "pending").length,
    totalRevenue: transactions
      .filter((t) => t.type === "deposit" && t.status === "approved")
      .reduce((s, t) => s + Number(t.amount), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-gold/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-gold" size={24} />
            <span className="font-serif text-xl font-bold text-gradient-gold">ADMIN PANEL</span>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      <div className="pt-20 container mx-auto px-6 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Members", value: stats.totalMembers },
            { label: "Total Deposits", value: stats.totalDeposits },
            { label: "Pending Deposits", value: stats.pendingDeposits },
            { label: "Approved Revenue", value: `₵${stats.totalRevenue.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-gold/10 p-5">
              <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-serif font-bold text-gradient-gold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? "bg-gradient-gold text-primary-foreground" : "bg-card border border-gold/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="bg-card rounded-2xl border border-gold/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left p-4 text-muted-foreground font-medium">Full Name</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Username</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Balance</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b border-gold/5 hover:bg-muted/20">
                      <td className="p-4 text-foreground">
                        {editingProfile?.id === p.id ? (
                          <input value={editingProfile.full_name} onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })} className="bg-background border border-gold/10 rounded px-2 py-1 text-foreground w-full" />
                        ) : p.full_name}
                      </td>
                      <td className="p-4 text-foreground">
                        {editingProfile?.id === p.id ? (
                          <input value={editingProfile.username} onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })} className="bg-background border border-gold/10 rounded px-2 py-1 text-foreground w-full" />
                        ) : p.username}
                      </td>
                      <td className="p-4 text-foreground">
                        {editingProfile?.id === p.id ? (
                          <input type="number" value={editingProfile.balance} onChange={(e) => setEditingProfile({ ...editingProfile, balance: parseFloat(e.target.value) || 0 })} className="bg-background border border-gold/10 rounded px-2 py-1 text-foreground w-24" />
                        ) : `₵${Number(p.balance).toFixed(2)}`}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_suspended ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-400"}`}>
                          {p.is_suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingProfile?.id === p.id ? (
                            <>
                              <button onClick={saveProfile} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"><Save size={14} /></button>
                              <button onClick={() => setEditingProfile(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingProfile(p)} className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80"><Edit size={14} /></button>
                              <button onClick={() => toggleSuspend(p)} className={`p-1.5 rounded-lg ${p.is_suspended ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"} hover:opacity-80`}>
                                {p.is_suspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No members yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-card rounded-2xl border border-gold/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const profile = profiles.find((p) => p.user_id === t.user_id);
                    return (
                      <tr key={t.id} className="border-b border-gold/5 hover:bg-muted/20">
                        <td className="p-4 text-foreground">{profile?.username || "Unknown"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === "deposit" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4 text-foreground font-medium">₵{Number(t.amount).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === "approved" ? "bg-green-500/20 text-green-400" :
                            t.status === "rejected" ? "bg-destructive/20 text-destructive" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {t.status === "pending" && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => updateTransactionStatus(t.id, "approved")} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium">
                                Approve
                              </button>
                              <button onClick={() => updateTransactionStatus(t.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs font-medium">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl border border-gold/10 p-6">
                {editingProduct?.id === p.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                        <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Price (₵)</label>
                        <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Reign Days</label>
                        <input type="number" value={editingProduct.reign_days} onChange={(e) => setEditingProduct({ ...editingProduct, reign_days: parseInt(e.target.value) || 50 })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" />
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2 text-sm text-foreground">
                          <input type="checkbox" checked={editingProduct.is_active} onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })} className="rounded" />
                          Active
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                      <textarea value={editingProduct.description || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground h-20 resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveProduct} className="px-4 py-2 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-medium"><Save size={14} className="inline mr-1" /> Save</button>
                      <button onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{p.name}</h3>
                      <p className="text-muted-foreground text-sm">{p.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Price: <strong className="text-gold">₵{Number(p.price).toFixed(2)}</strong></span>
                        <span>Return: <strong className="text-green-400">₵{(Number(p.price) * 2).toFixed(2)}</strong></span>
                        <span>Days: {p.reign_days}</span>
                        <span className={p.is_active ? "text-green-400" : "text-destructive"}>{p.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <button onClick={() => setEditingProduct(p)} className="p-2 rounded-xl bg-muted text-foreground hover:bg-muted/80">
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <button
              onClick={() => setEditingPayment({ id: "new", name: "", details: "", is_active: true })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-medium"
            >
              <Plus size={16} /> Add Payment Method
            </button>

            {editingPayment?.id === "new" && (
              <div className="bg-card rounded-2xl border border-gold/10 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input value={editingPayment.name} onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" placeholder="e.g. MTN Mobile Money" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Details</label>
                    <input value={editingPayment.details} onChange={(e) => setEditingPayment({ ...editingPayment, details: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" placeholder="e.g. 024 XXX XXXX" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={savePaymentMethod} className="px-4 py-2 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-medium"><Save size={14} className="inline mr-1" /> Save</button>
                  <button onClick={() => setEditingPayment(null)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
                </div>
              </div>
            )}

            {paymentMethods.map((pm) => (
              <div key={pm.id} className="bg-card rounded-2xl border border-gold/10 p-6">
                {editingPayment?.id === pm.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                        <input value={editingPayment.name} onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Details</label>
                        <input value={editingPayment.details} onChange={(e) => setEditingPayment({ ...editingPayment, details: e.target.value })} className="w-full bg-background border border-gold/10 rounded-xl px-3 py-2 text-foreground" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={editingPayment.is_active} onChange={(e) => setEditingPayment({ ...editingPayment, is_active: e.target.checked })} />
                      Active
                    </label>
                    <div className="flex gap-2">
                      <button onClick={savePaymentMethod} className="px-4 py-2 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-medium"><Save size={14} className="inline mr-1" /> Save</button>
                      <button onClick={() => setEditingPayment(null)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{pm.name}</h3>
                      <p className="text-muted-foreground text-sm">{pm.details}</p>
                      <span className={`text-xs ${pm.is_active ? "text-green-400" : "text-destructive"}`}>{pm.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <button onClick={() => setEditingPayment(pm)} className="p-2 rounded-xl bg-muted text-foreground hover:bg-muted/80">
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
