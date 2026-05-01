import { useEffect, useState } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  admin_reply: string | null;
  status: string;
  created_at: string;
  replied_at: string | null;
}

interface SupportBotProps {
  variant?: "floating" | "inline";
}

const SupportBot = ({ variant = "floating" }: SupportBotProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(variant === "inline");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTickets(data as Ticket[]);
  };

  useEffect(() => {
    if (open && user) loadTickets();
  }, [open, user]);

  useEffect(() => {
    if (!user || !open) return;
    const channel = supabase
      .channel("support_tickets_user")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
        () => loadTickets()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, open]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in both fields", variant: "destructive" });
      return;
    }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 2000),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report sent! Admin will reply shortly." });
    setSubject("");
    setMessage("");
    loadTickets();
  };

  const panel = (
    <div className="bg-card rounded-3xl border border-gold/10 overflow-hidden">
      <div className="bg-gradient-gold p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
          <Bot className="text-primary-foreground" size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-primary-foreground font-bold">Support Bot</h3>
          <p className="text-primary-foreground/80 text-xs">We typically reply within a few hours</p>
        </div>
        {variant === "floating" && (
          <button onClick={() => setOpen(false)} className="text-primary-foreground hover:opacity-80">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
        {tickets.length === 0 || !tickets.some((t) => t.admin_reply) ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Bot className="mx-auto mb-2 text-gold" size={32} />
            Send your report below. Our support bot will respond directly here.
          </div>
        ) : (
          tickets
            .filter((t) => t.admin_reply)
            .map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="bg-gold/10 rounded-2xl rounded-tl-sm p-3 border border-gold/20">
                  <p className="text-gold font-semibold text-xs mb-1 flex items-center gap-1">
                    <Bot size={12} /> Bot reply
                  </p>
                  <p className="text-foreground text-sm">{t.admin_reply}</p>
                  <p className="text-muted-foreground/60 text-[10px] mt-2">
                    Re: {t.subject}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="p-4 border-t border-gold/10 space-y-2 bg-background/30">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          maxLength={200}
          className="w-full px-3 py-2 rounded-lg bg-background border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-background border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30 resize-none"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-gold text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Send size={16} /> {loading ? "Sending..." : "Send Report"}
        </button>
      </div>
    </div>
  );

  if (variant === "inline") return panel;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-gold shadow-lg shadow-gold/30 flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Open support bot"
        >
          <MessageCircle className="text-primary-foreground" size={26} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
          {panel}
        </div>
      )}
    </>
  );
};

export default SupportBot;
