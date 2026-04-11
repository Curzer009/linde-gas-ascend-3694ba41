const products = [
  { name: "MASS GAS", price: 80 },
  { name: "SOLAR CONVERTOR", price: 150 },
  { name: "OXYGEN TANK", price: 300 },
  { name: "NPK COMPOUNDS", price: 500 },
  { name: "EXTRACTED COMPOST", price: 900 },
];

const ReturnsTable = () => {
  return (
    <section id="returns" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Transparent Returns
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-gradient-gold">Earnings</span> Breakdown
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Complete math breakdown showing exactly how your returns are calculated over the 50-day period.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="bg-card rounded-3xl border border-gold/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  {["Product", "Price", "Daily Income", "50-Day Return", "Net Profit", "ROI"].map((h) => (
                    <th key={h} className="px-6 py-5 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const daily = (p.price * 2) / 50;
                  const total = p.price * 2;
                  const profit = total - p.price;
                  return (
                    <tr key={p.name} className={`border-b border-gold/5 hover:bg-gold/5 transition-colors ${i === products.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-6 py-5 font-serif font-bold text-foreground">{p.name}</td>
                      <td className="px-6 py-5 text-foreground font-semibold">₵{p.price}</td>
                      <td className="px-6 py-5 text-gold font-semibold">₵{daily.toFixed(2)}</td>
                      <td className="px-6 py-5 text-foreground">
                        <span className="text-muted-foreground text-xs">₵{daily.toFixed(2)} × 50 = </span>
                        <span className="font-semibold">₵{total}</span>
                      </td>
                      <td className="px-6 py-5 text-gold font-bold">+₵{profit}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold">100%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReturnsTable;
