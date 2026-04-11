import { TrendingUp, Zap, Wind, Sun, Leaf, FlaskConical } from "lucide-react";

interface Product {
  name: string;
  price: number;
  icon: React.ElementType;
  description: string;
  color: string;
}

const products: Product[] = [
  { name: "MASS GAS", price: 80, icon: Wind, description: "Industrial-grade mass gas solution for energy production and manufacturing.", color: "from-blue-500/20 to-blue-600/5" },
  { name: "SOLAR CONVERTOR", price: 150, icon: Sun, description: "High-efficiency solar conversion technology for sustainable energy generation.", color: "from-amber-500/20 to-amber-600/5" },
  { name: "OXYGEN TANK", price: 300, icon: Zap, description: "Premium-grade compressed oxygen tanks for medical and industrial applications.", color: "from-cyan-500/20 to-cyan-600/5" },
  { name: "NPK COMPOUNDS", price: 500, icon: FlaskConical, description: "Advanced nitrogen-phosphorus-potassium compounds for superior agricultural yield.", color: "from-emerald-500/20 to-emerald-600/5" },
  { name: "EXTRACTED COMPOST", price: 900, icon: Leaf, description: "Biologically enriched compost extract for maximum soil fertility and growth.", color: "from-green-500/20 to-green-600/5" },
];

const ProductCard = ({ product }: { product: Product }) => {
  const totalReturn = product.price * 2;
  const dailyIncome = totalReturn / 50;
  const totalProfit = totalReturn - product.price;

  return (
    <div className="group relative bg-card rounded-3xl border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-500 hover:glow-gold">
      <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative p-8">
        {/* Icon & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center">
            <product.icon className="text-primary-foreground" size={28} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">{product.name}</h3>
            <p className="text-muted-foreground text-sm">{product.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <span className="text-muted-foreground text-sm">Investment Price</span>
          <div className="text-4xl font-serif font-bold text-gradient-gold">₵{product.price}</div>
        </div>

        {/* Math Breakdown */}
        <div className="bg-background/50 rounded-2xl p-5 mb-6 space-y-3 border border-gold/5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Daily Income</span>
            <span className="text-gold font-bold">₵{dailyIncome.toFixed(2)}/day</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Generation Period</span>
            <span className="text-foreground font-semibold">50 days</span>
          </div>
          <div className="h-px bg-gold/10" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Total Return</span>
            <span className="text-foreground font-semibold">₵{dailyIncome.toFixed(2)} × 50 = ₵{totalReturn}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Net Profit</span>
            <span className="text-gold font-bold text-lg">+₵{totalProfit}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gold">
            <TrendingUp size={16} />
            <span className="text-sm font-semibold">100% ROI</span>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-4 rounded-2xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
          Invest ₵{product.price} Now
        </button>
      </div>
    </div>
  );
};

const ProductsSection = () => {
  return (
    <section id="products" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Our Products
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Premium <span className="text-gradient-gold">Investment</span> Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Each product generates 2× its value over a 50-day period with guaranteed daily returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
