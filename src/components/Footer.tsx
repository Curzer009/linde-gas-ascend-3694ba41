const Footer = () => {
  return (
    <footer id="contact" className="py-16 bg-secondary/30 border-t border-gold/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
              </div>
              <span className="font-serif text-xl font-bold text-gradient-gold">LINDE GAS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium industrial products with guaranteed 2× returns over a 50-day generation period.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Products", "How It Works", "Returns"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block text-muted-foreground text-sm hover:text-gold transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold text-foreground mb-4">Contact Us</h4>
            <a
              href="https://whatsapp.com/channel/0029Vb7fjyr4dTnDmhjmml2x"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm font-semibold"
            >
              Chat with us on WhatsApp
            </a>
            <p className="text-muted-foreground text-sm mt-1">Available 24/7</p>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} LINDE GAS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
