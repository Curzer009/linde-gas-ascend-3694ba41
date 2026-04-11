import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Users, Receipt, Package, CreditCard, LogOut, Shield, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  balance: number;
  is_suspended: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  icon_name: string;
  color: string;
  reign_days: number;
  is_active: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  is_active: boolean;
}

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [members, setMembers] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit dialogs
  const [editMember, setEditMember] = useState<Profile | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editPayment, setEditPayment] = useState<PaymentMethod | null>(null);
  const [newPayment, setNewPayment] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState({ name: "", details: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [m, t, p, pm] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("price", { ascending: true }),
      supabase.from("payment_methods").select("*").order("name"),
    ]);
    if (m.data) setMembers(m.data);
    if (t.data) setTransactions(t.data);
    if (p.data) setProducts(p.data);
    if (pm.data) setPaymentMethods(pm.data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // MEMBERS
  const toggleSuspend = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: !profile.is_suspended })
      .eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: profile.is_suspended ? "User unsuspended" : "User suspended" });
      fetchAll();
    }
  };

  const saveMember = async () => {
    if (!editMember) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editMember.full_name,
        username: editMember.username,
        balance: editMember.balance,
      })
      .eq("id", editMember.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Member updated" });
      setEditMember(null);
      fetchAll();
    }
  };

  // PRODUCTS
  const saveProduct = async () => {
    if (!editProduct) return;
    const { error } = await supabase
      .from("products")
      .update({
        name: editProduct.name,
        price: editProduct.price,
        description: editProduct.description,
        reign_days: editProduct.reign_days,
        is_active: editProduct.is_active,
      })
      .eq("id", editProduct.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product updated" });
      setEditProduct(null);
      fetchAll();
    }
  };

  // PAYMENT METHODS
  const savePayment = async () => {
    if (!editPayment) return;
    const { error } = await supabase
      .from("payment_methods")
      .update({
        name: editPayment.name,
        details: editPayment.details,
        is_active: editPayment.is_active,
      })
      .eq("id", editPayment.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment method updated" });
      setEditPayment(null);
      fetchAll();
    }
  };

  const addPaymentMethod = async () => {
    const { error } = await supabase
      .from("payment_methods")
      .insert({ name: newPaymentData.name, details: newPaymentData.details });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment method added" });
      setNewPayment(false);
      setNewPaymentData({ name: "", details: "" });
      fetchAll();
    }
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment method deleted" });
      fetchAll();
    }
  };

  // TRANSACTIONS
  const updateTransactionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Transaction ${status}` });
      fetchAll();
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberName = (userId: string) => {
    const m = members.find((m) => m.user_id === userId);
    return m ? m.username : userId.slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-gold" size={24} />
            <span className="font-serif text-xl font-bold text-gradient-gold">Admin Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
            <LogOut size={16} className="mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-12 container mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-gold/10 bg-card">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto text-gold mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card className="border-gold/10 bg-card">
            <CardContent className="p-4 text-center">
              <Receipt className="mx-auto text-gold mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
          <Card className="border-gold/10 bg-card">
            <CardContent className="p-4 text-center">
              <Package className="mx-auto text-gold mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card className="border-gold/10 bg-card">
            <CardContent className="p-4 text-center">
              <CreditCard className="mx-auto text-gold mb-2" size={24} />
              <p className="text-2xl font-bold text-foreground">{paymentMethods.length}</p>
              <p className="text-xs text-muted-foreground">Payment Methods</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full bg-card border border-gold/10 mb-6">
            <TabsTrigger value="members" className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              <Users size={14} className="mr-1.5" /> Members
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              <Receipt size={14} className="mr-1.5" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              <Package size={14} className="mr-1.5" /> Products
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              <CreditCard size={14} className="mr-1.5" /> Payments
            </TabsTrigger>
          </TabsList>

          {/* MEMBERS TAB */}
          <TabsContent value="members">
            <Card className="border-gold/10 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Members ({filteredMembers.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-secondary border-gold/10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10">
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((m) => (
                      <TableRow key={m.id} className="border-gold/5">
                        <TableCell className="font-medium text-foreground">{m.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.username}</TableCell>
                        <TableCell className="text-gold font-semibold">₵{Number(m.balance).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.is_suspended ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-400"}`}>
                            {m.is_suspended ? "Suspended" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(m.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-gold/20 hover:bg-gold/10" onClick={() => setEditMember({ ...m })}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={m.is_suspended ? "default" : "destructive"}
                              className="h-7 text-xs"
                              onClick={() => toggleSuspend(m)}
                            >
                              {m.is_suspended ? "Unsuspend" : "Suspend"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRANSACTIONS TAB */}
          <TabsContent value="transactions">
            <Card className="border-gold/10 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10">
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id} className="border-gold/5">
                        <TableCell className="font-medium text-foreground">{getMemberName(t.user_id)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "deposit" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                            {t.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-gold font-semibold">₵{Number(t.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.status === "approved" ? "bg-green-500/20 text-green-400" :
                            t.status === "rejected" ? "bg-destructive/20 text-destructive" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {t.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{t.reference || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(t.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {t.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateTransactionStatus(t.id, "approved")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateTransactionStatus(t.id, "rejected")}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No transactions yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <Card className="border-gold/10 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Products Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10">
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Reign Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id} className="border-gold/5">
                        <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                        <TableCell className="text-gold font-semibold">₵{Number(p.price).toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{p.reign_days} days</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}`}>
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-gold/20 hover:bg-gold/10" onClick={() => setEditProduct({ ...p })}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments">
            <Card className="border-gold/10 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Payment Methods</CardTitle>
                  <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={() => setNewPayment(true)}>
                    + Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10">
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((pm) => (
                      <TableRow key={pm.id} className="border-gold/5">
                        <TableCell className="font-medium text-foreground">{pm.name}</TableCell>
                        <TableCell className="text-muted-foreground">{pm.details}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pm.is_active ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}`}>
                            {pm.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-gold/20 hover:bg-gold/10" onClick={() => setEditPayment({ ...pm })}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deletePayment(pm.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paymentMethods.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payment methods yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* EDIT MEMBER DIALOG */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent className="bg-card border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Member</DialogTitle>
          </DialogHeader>
          {editMember && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <Input value={editMember.full_name} onChange={(e) => setEditMember({ ...editMember, full_name: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Username</label>
                <Input value={editMember.username} onChange={(e) => setEditMember({ ...editMember, username: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Balance (₵)</label>
                <Input type="number" value={editMember.balance} onChange={(e) => setEditMember({ ...editMember, balance: Number(e.target.value) })} className="bg-secondary border-gold/10" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)} className="border-gold/20">Cancel</Button>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={saveMember}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PRODUCT DIALOG */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="bg-card border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Price (₵)</label>
                <Input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <Input value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Reign Days</label>
                <Input type="number" value={editProduct.reign_days} onChange={(e) => setEditProduct({ ...editProduct, reign_days: Number(e.target.value) })} className="bg-secondary border-gold/10" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editProduct.is_active} onCheckedChange={(v) => setEditProduct({ ...editProduct, is_active: v })} />
                <label className="text-sm text-muted-foreground">Active</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)} className="border-gold/20">Cancel</Button>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={saveProduct}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PAYMENT DIALOG */}
      <Dialog open={!!editPayment} onOpenChange={() => setEditPayment(null)}>
        <DialogContent className="bg-card border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Payment Method</DialogTitle>
          </DialogHeader>
          {editPayment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={editPayment.name} onChange={(e) => setEditPayment({ ...editPayment, name: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Details</label>
                <Input value={editPayment.details} onChange={(e) => setEditPayment({ ...editPayment, details: e.target.value })} className="bg-secondary border-gold/10" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editPayment.is_active} onCheckedChange={(v) => setEditPayment({ ...editPayment, is_active: v })} />
                <label className="text-sm text-muted-foreground">Active</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPayment(null)} className="border-gold/20">Cancel</Button>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={savePayment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW PAYMENT DIALOG */}
      <Dialog open={newPayment} onOpenChange={setNewPayment}>
        <DialogContent className="bg-card border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name (e.g. MTN Mobile Money)</label>
              <Input value={newPaymentData.name} onChange={(e) => setNewPaymentData({ ...newPaymentData, name: e.target.value })} className="bg-secondary border-gold/10" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Details (e.g. account number)</label>
              <Input value={newPaymentData.details} onChange={(e) => setNewPaymentData({ ...newPaymentData, details: e.target.value })} className="bg-secondary border-gold/10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPayment(false)} className="border-gold/20">Cancel</Button>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={addPaymentMethod}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
