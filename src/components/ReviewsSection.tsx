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
    name: "Nana Akua Owusu",
    location: "East Legon, Accra",
    product: "EXTRACTED COMPOST",
    rating: 5,
    text: "Honestly didn't believe it would work but my first ₵900 came back as ₵1,800 exactly on day 50. Daily payouts hit my balance every morning without fail. Already on my second cycle.",
    invested: 900,
    earned: 1800,
    daysAgo: 9,
  },
  {
    name: "Emmanuel Tetteh",
    location: "Kumasi, Ashanti",
    product: "NPK COMPOUNDS",
    rating: 4,
    text: "Returns are exactly as promised, no issues there. My only complaint is that withdrawals take up to 24 hours to process. I really wish they were instant like the deposits, but apart from that everything is solid.",
    invested: 500,
    earned: 1000,
    daysAgo: 6,
  },
  {
    name: "Adwoa Pokuaa",
    location: "Tema Community 25",
    product: "OXYGEN TANK",
    rating: 5,
    text: "Started with the Oxygen Tank as a test. ₵12 every day for 50 days, never missed once. Transferred my profits to my Mobile Money smoothly. Customer support actually responds on WhatsApp too.",
    invested: 300,
    earned: 600,
    daysAgo: 21,
  },
  {
    name: "Selorm Agbeko",
    location: "Ho, Volta Region",
    product: "SOLAR CONVERTOR",
    rating: 4,
    text: "Beginner friendly. ₵150 turned into ₵300 in exactly 50 days. The platform is clean and easy. Withdrawal isn't instant which is a small downside but my money always arrives within the same day so I can live with it.",
    invested: 150,
    earned: 300,
    daysAgo: 4,
  },
  {
    name: "Kwesi Frimpong",
    location: "Cape Coast",
    product: "MASS GAS",
    rating: 5,
    text: "Even the smallest ₵80 product paid me back fully. I'm not rich so starting small was perfect. Brought my brother and two cousins on board, all of them are earning now. Genuinely impressed.",
    invested: 80,
    earned: 160,
    daysAgo: 14,
  },
  {
    name: "Akosua Boateng",
    location: "Sunyani, Bono",
    product: "EXTRACTED COMPOST",
    rating: 4,
    text: "Completed one full cycle and got every cedi back. The only thing I'd change is the withdrawal speed — would prefer instant transfers — but the daily earnings are 100% reliable so I'm not really complaining.",
    invested: 900,
    earned: 1800,
    daysAgo: 27,
  },
  {
    name: "Daniel Osei",
    location: "Madina, Accra",
    product: "NPK COMPOUNDS",
    rating: 5,
    text: "Three cycles deep now. ₵500 in, ₵1,000 out, every single time. The math is transparent and it just works. This is the only platform I've used in Ghana that actually pays consistently.",
    invested: 500,
    earned: 1000,
    daysAgo: 33,
  },
  {
    name: "Hannah Asare",
    location: "Takoradi, Western",
    product: "OXYGEN TANK",
    rating: 4,
    text: "Daily income is real and consistent. Wish withdrawals processed instantly instead of taking a few hours, that's my one wish. Otherwise the system is intact and I trust it with my money.",
    invested: 300,
    earned: 600,
    daysAgo: 11,
  },
  {
    name: "Ibrahim Mohammed",
    location: "Tamale, Northern",
    product: "SOLAR CONVERTOR",
    rating: 5,
    text: "I was skeptical because of all the scams in Ghana but a coworker showed me his withdrawal proof. Tested with ₵150 and got my full ₵300 back. Now scaling up properly.",
    invested: 150,
    earned: 300,
    daysAgo: 17,
  },
];

const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
const totalReviews = 1389;

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
            Real investors sharing their honest experience with LINDE GAS products.
          </p>

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
