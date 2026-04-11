import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
          </div>
          <span className="font-serif text-xl font-bold text-gradient-gold">LINDE GAS</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["Products", "How It Works", "Returns", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-300"
            >
              {item}
            </a>
          ))}
          <a
            href="#products"
            className="px-6 py-2.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-gold/10 px-6 py-6 space-y-4">
          {["Products", "How It Works", "Returns", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setIsOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-gold transition-colors"
            >
              {item}
            </a>
          ))}
          <a
            href="#products"
            onClick={() => setIsOpen(false)}
            className="block text-center px-6 py-2.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold text-sm"
          >
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
