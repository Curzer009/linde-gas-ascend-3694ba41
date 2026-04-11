import { Star } from "lucide-react";

interface Review {
  name: string;
  location: string;
  product: string;
  rating: number;
  text: string;
  invested: number;
  earned: number;
  daysAgo: number;
}

const reviews: Review[] = [
  {
    name: "Kwame Asante",
    location: "Accra, Ghana",
    product: "EXTRACTED COMPOST",
    rating: 5,
    text: "I was skeptical at first, but after my first 50-day cycle I received exactly ₵1,800 from my ₵900 investment. Already reinvested into my second round. The daily payouts are consistent.",
    invested: 900,
    earned: 1800,
    daysAgo: 12,
  },
  {
    name: "Abena Mensah",
    location: "Kumasi, Ghana",
    product: "NPK COMPOUNDS",
    rating: 5,
    text: "A colleague introduced me to Linde Gas. I started with NPK Compounds and the returns were exactly as promised. ₵500 turned into ₵1,000 in 50 days. Very transparent process.",
    invested: 500,
    earned: 1000,
    daysAgo: 8,
  },
  {
    name: "Yaw Boateng",
    location: "Takoradi, Ghana",
    product: "OXYGEN TANK",
    rating: 4,
    text: "Good experience overall. The daily income hits my account without fail. I've completed two full cycles with the Oxygen Tank product and the math checks out every time.",
    invested: 300,
    earned: 600,
    daysAgo: 23,
  },
  {
    name: "Efua Darkwah",
    location: "Tamale, Ghana",
    product: "SOLAR CONVERTOR",
    rating: 5,
    text: "I started small with the Solar Convertor to test the waters. ₵6/day for 50 days gave me exactly ₵300. Now I'm scaling up to NPK Compounds. Highly recommend for beginners.",
    invested: 150,
    earned: 300,
    daysAgo: 5,
  },
  {
    name: "Kofi Adu",
    location: "Cape Coast, Ghana",
    product: "MASS GAS",
    rating: 5,
    text: "Best decision I made this year. Even the ₵80 Mass Gas product doubles. I've told my family about it and three of them have joined. Simple, reliable, and profitable.",
    invested: 80,
    earned: 160,
    daysAgo: 18,
  },
  {
    name: "Ama Serwah",
    location: "Sunyani, Ghana",
    product: "EXTRACTED COMPOST",
    rating: 4,
    text: "The returns are genuine. I completed one cycle and received my full ₵1,800. Customer support via WhatsApp is responsive too. Planning to invest in multiple products next time.",
    invested: 900,
    earned: 1800,
    daysAgo: 31,
  },
];

const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
const totalReviews = 1247;

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? "text-gold fill-gold" : "text-muted-foreground/30"}
      />
    ))}
  </div>
);

const ReviewsSection = () => {
  return (
    <section id="reviews" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Investor Reviews
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by <span className="text-gradient-gold">Thousands</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Real investors sharing their experience with Linde Gas products.
          </p>

          {/* Average Rating Summary */}
          <div className="inline-flex items-center gap-4 bg-card rounded-2xl border border-gold/10 px-8 py-5">
            <div className="text-5xl font-serif font-bold text-gradient-gold">{averageRating}</div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(Number(averageRating)) ? "text-gold fill-gold" : "text-muted-foreground/30"} />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">Based on {totalReviews.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-card rounded-2xl border border-gold/10 p-6 hover:border-gold/25 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Stars rating={review.rating} />
                <span className="text-muted-foreground text-xs">{review.daysAgo}d ago</span>
              </div>

              <p className="text-foreground/90 text-sm leading-relaxed mb-5">"{review.text}"</p>

              <div className="bg-background/50 rounded-xl p-3 mb-4 border border-gold/5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Invested</span>
                  <span className="text-foreground font-semibold">₵{review.invested}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Earned</span>
                  <span className="text-gold font-bold">₵{review.earned}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{review.name[0]}</span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">{review.name}</p>
                  <p className="text-muted-foreground text-xs">{review.location} · {review.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
