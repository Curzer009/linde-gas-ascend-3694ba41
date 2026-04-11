import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, Wallet, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const links = [
    { to: "/products", label: "Products", icon: ShoppingBag },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/products" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
          </div>
          <span className="font-serif text-xl font-bold text-gradient-gold">LINDE GAS</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(to) ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-gold/10 px-6 py-6 space-y-4">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(to) ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button
            onClick={() => { setIsOpen(false); handleSignOut(); }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default DashboardNav;
