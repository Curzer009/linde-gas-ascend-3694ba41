import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Home;
