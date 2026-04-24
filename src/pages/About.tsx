import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Leaf, Users, Heart, Scale, Link2, HardHat, Globe, TrendingUp } from "lucide-react";

const sections = [
  {
    icon: Globe,
    title: "Our Company",
    text: "Every day around the world, our people are inspired by our mission of making our world more productive. As a leading global industrial gases and engineering company, we deliver high-quality solutions, technologies and services which are making our customers more successful and helping to sustain, decarbonize and protect our planet.",
  },
  {
    icon: Leaf,
    title: "Making Energy Clean",
    text: "We are actively contributing to the widespread adoption of clean energy, such as hydrogen and its derivatives, and significantly cutting emissions through carbon capture, utilization and storage technologies. We are committed to making our world more productive, sustainably through our operations and engineering expertise, established infrastructure and strong investment in decarbonization projects and R&D.",
  },
  {
    icon: Heart,
    title: "Community Engagement",
    text: "Community is a corporate value at Linde. Connecting with the communities where we live and work and fostering resilience are key priorities for us. Through charitable contributions, volunteering, and strategic investments, our people live our mission of making our world more productive every day.",
  },
  {
    icon: Users,
    title: "Inclusion at Linde",
    text: "With operations in more than 80 countries — diversity isn't something that Linde does, it's simply who we are. Our employees around the globe each bring their diverse backgrounds, skills and experiences and help foster a collaborative, innovative and performance-driven workplace. At Linde, inclusion is a core value — we strive to provide an environment where individuals of all backgrounds feel comfortable bringing their ideas to the table.",
  },
  {
    icon: Scale,
    title: "Guided by Integrity",
    text: "Integrity is one of our core values. It is at the heart of everything we do and say at Linde. Ethical, respectful, fair, and compliant behaviors build transparency and trust, creating a solid basis for growth and prosperity to the benefit of our employees, customers, suppliers, markets and communities.",
  },
  {
    icon: Link2,
    title: "Building a Robust Supply Chain",
    text: "We value the role our suppliers and contractors play in our ability to deliver on the promises to our customers and to the communities in which we operate. We choose our suppliers carefully based on merit as well as alignment with our values, and we continue to foster diversity and local sourcing.",
  },
  {
    icon: HardHat,
    title: "Zero Today",
    text: "Zero Today means we are driving toward zero incidents and zero injuries today and every day. Our core value of Safety keeps us focused on what matters most: the well-being of our people, the environment and the communities in which we operate.",
  },
  {
    icon: Shield,
    title: "Sustainability in Focus",
    text: "At Linde, we are actively engaged in efforts to reduce our own footprint as part of our commitment to protect our planet for the long term. We deliver on our commitment through concrete measures focused around Climate Change, Safety, Health and Environment, People and Community, and Integrity and Compliance.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-semibold tracking-wider uppercase mb-6">
            About Us
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why <span className="text-gradient-gold">LINDE GAS</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
            Linde is a leading global industrial gases and engineering company with 2024 sales of $33 billion. We live our mission of making our world more productive every day by providing high-quality solutions, technologies and services. Our industrial gases and technologies are used in countless applications including production of clean hydrogen, life-saving medical oxygen and high-purity & specialty gases for electronics. For over 50 years, Linde has been a global leader in hydrogen and is leveraging its engineering capabilities to make cleaner energy a reality worldwide.
          </p>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-6xl grid gap-8 md:grid-cols-2">
          {sections.map((s, i) => (
            <div
              key={i}
              className="group relative bg-card border border-gold/10 rounded-2xl p-8 hover:border-gold/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                  <s.icon className="text-gold" size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "80+", label: "Countries" },
              { value: "$33B", label: "2024 Sales" },
              { value: "50+", label: "Years in H₂" },
              { value: "66K+", label: "Employees" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-gold/10">
                <div className="font-serif text-3xl font-bold text-gradient-gold mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
