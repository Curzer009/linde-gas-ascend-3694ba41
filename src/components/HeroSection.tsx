import heroBg from "@/assets/hero-bg.jpg";
import { ArrowDown, TrendingUp, Shield, Clock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Linde Gas premium background"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-6">
            Premium Investment Products
          </span>
        </div>

        <h1 className="animate-fade-up-delay font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          <span className="text-foreground">Invest in </span>
          <span className="text-gradient-gold">Excellence</span>
        </h1>

        <p className="animate-fade-up-delay-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Acquire premium industrial products and earn <span className="text-gold font-semibold">2× returns</span> over a 50-day generation period. Guaranteed daily income, powered by LINDE GAS.
        </p>

        <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#products"
            className="px-8 py-4 rounded-full bg-gradient-gold text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity glow-gold"
          >
            Explore Products
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full border border-gold/30 text-gold font-semibold text-lg hover:bg-gold/10 transition-colors"
          >
            How It Works
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: TrendingUp, label: "2× Returns", desc: "Double your investment" },
            { icon: Clock, label: "50 Days", desc: "Generation period" },
            { icon: Shield, label: "Guaranteed", desc: "Daily income payouts" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 justify-center bg-card/50 backdrop-blur-sm rounded-2xl px-5 py-4 border border-gold/10">
              <Icon className="text-gold" size={24} />
              <div className="text-left">
                <p className="text-foreground font-semibold text-sm">{label}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <a href="#products" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <ArrowDown className="text-gold/60" size={28} />
      </a>
    </section>
  );
};

export default HeroSection;
