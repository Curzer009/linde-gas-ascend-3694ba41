import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (hash: string) => {
    setIsOpen(false);
    if (location.pathname === "/") {
      // Already on home, just scroll
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home then scroll
      navigate("/" + hash);
    }
  };

  const navItems = [
    { label: "How It Works", hash: "#how-it-works" },
    { label: "Reviews", hash: "#reviews" },
    { label: "Contact", hash: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/page-bg.png" alt="LEND GAS logo" className="w-10 h-10 rounded-full object-cover border border-gold/30" />
          <span className="font-serif text-xl font-bold text-gradient-gold">LEND GAS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-300">
            About Us
          </Link>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleAnchorClick(item.hash)}
              className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/signup"
            className="px-6 py-2.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-gold/10 px-6 py-6 space-y-4">
          <Link to="/about" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
            About Us
          </Link>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleAnchorClick(item.hash)}
              className="block text-sm font-medium text-muted-foreground hover:text-gold transition-colors bg-transparent border-none cursor-pointer text-left"
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="block text-center px-6 py-2.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold text-sm"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
