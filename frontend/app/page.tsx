import HeroSection from "@/components/sections/HeroSection";
import FeaturedCollection from "@/components/sections/FeaturedCollection";
import NewArrivals from "@/components/sections/NewArrivals";
import CategoriesSection from "@/components/sections/CategoriesSection";
import BestSellers from "@/components/sections/BestSellers";
import BrandStory from "@/components/sections/BrandStory";
import Testimonials from "@/components/sections/Testimonials";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedCollection />
      <NewArrivals />
      <CategoriesSection />
      <BestSellers />
      <BrandStory />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
