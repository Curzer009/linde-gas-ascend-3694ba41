import { ShoppingCart, Clock, Wallet, TrendingUp } from "lucide-react";

const steps = [
  { icon: ShoppingCart, title: "Choose a Product", desc: "Select from our premium range of investment products starting from ₵80." },
  { icon: Wallet, title: "Make Your Investment", desc: "Securely invest in your chosen product and activate your income generation." },
  { icon: Clock, title: "Earn Daily Income", desc: "Receive consistent daily payouts throughout the 50-day generation period." },
  { icon: TrendingUp, title: "Collect 2× Returns", desc: "By day 50, you'll have earned double your initial investment — guaranteed." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Simple Process
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four simple steps to start generating income with LINDE GAS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-card border border-gold/20 flex items-center justify-center group-hover:glow-gold transition-all duration-300">
                <step.icon className="text-gold" size={32} />
              </div>
              <span className="absolute top-0 right-1/2 translate-x-12 -translate-y-1 text-gold/20 font-serif text-5xl font-bold">
                {i + 1}
              </span>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
