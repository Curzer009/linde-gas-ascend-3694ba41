import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ShoppingBag, Wallet, Users, User, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Step = {
  target?: string;
  title: string;
  body: string;
  icon: React.ElementType;
};

const STEPS: Step[] = [
  {
    title: "Welcome to LINDE GAS",
    body: "Let's take a quick tour so you know exactly where everything is. It only takes a few seconds.",
    icon: Sparkles,
  },
  {
    target: "products",
    title: "Products",
    body: "Browse our premium products and buy one using your bonus balance to start earning daily income.",
    icon: ShoppingBag,
  },
  {
    target: "wallet",
    title: "Wallet",
    body: "Recharge your account, request a withdrawal, and review every deposit and payout in your history.",
    icon: Wallet,
  },
  {
    target: "referrals",
    title: "Referrals",
    body: "Share your invite link. When a friend joins and buys a product, you receive a reward code to claim.",
    icon: Users,
  },
  {
    target: "profile",
    title: "Profile",
    body: "Update your details and reach support any time you need a hand.",
    icon: User,
  },
  {
    title: "You're all set",
    body: "That's everything. Recharge your wallet, pick a product, and start earning today.",
    icon: CheckCircle2,
  },
];

const storageKey = (id?: string) => `onboarding-complete:${id ?? "guest"}`;

const OnboardingTour = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (localStorage.getItem(storageKey(user.id)) === "true") return;
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [user, loading]);

  const step = STEPS[index];

  const measure = useCallback(() => {
    if (!step?.target) { setRect(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  const finish = () => {
    if (user) localStorage.setItem(storageKey(user.id), "true");
    setOpen(false);
  };

  if (!open || !step) return null;

  const Icon = step.icon;
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const pad = 8;

  const cardStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        top: Math.min(rect.bottom + 16, window.innerHeight - 260),
        left: Math.min(Math.max(rect.left + rect.width / 2 - 170, 16), Math.max(window.innerWidth - 356, 16)),
        width: 340,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(380px, calc(100vw - 32px))",
      };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={finish} />

      {rect && (
        <div
          className="absolute rounded-xl border-2 border-gold pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px hsl(var(--background) / 0.6)",
          }}
        />
      )}

      <div
        style={cardStyle}
        className="rounded-2xl border border-gold/20 bg-card p-6 shadow-2xl animate-fade-up"
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
      >
        <button
          onClick={finish}
          aria-label="Skip tour"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
          <Icon className="text-gold" size={22} />
        </div>

        <h3 className="font-serif text-xl font-bold text-foreground mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.body}</p>

        <div className="flex items-center gap-1.5 mb-4" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold" : i < index ? "w-3 bg-gold/50" : "w-3 bg-muted"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Step {index + 1} of {STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setIndex((i) => i - 1)}
                className="px-4 py-2 rounded-lg border border-gold/20 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            )}
            {!isLast && (
              <button
                onClick={finish}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
              className="px-5 py-2 rounded-lg bg-gradient-gold text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingTour;
