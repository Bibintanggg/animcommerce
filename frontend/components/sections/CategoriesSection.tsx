"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import SkeletonState from "../states/SkeletonStates";
import ErrorState from "../states/ErrorStates";
import errorAnimation from "../../public/assets/lottie/error-stress.json";
import { getAllProducts } from "@/services/product.service";
import { ProductCategory } from "@/enums/product-category";

export default function CategoriesSection() {
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const categories = useMemo(() => {
    if (!products) return [];

    return Object.values(ProductCategory).map((category) => {
      const firstProduct = products.find(
        (product) => product.category === category,
      );

      return {
        key: category,
        count: products.filter((product) => product.category === category)
          .length,
        image: firstProduct?.thumbnail ?? "/assets/default.jpg",
      };
    });
  }, [products]);
  const getCategoryImage = (key: string) => {
    switch (key) {
      case "figure":
        return "https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWN0aW9uJTIwZmlndXJlfGVufDB8fDB8fHww";

      case "accessory":
        return "https://tsuru.fr/116979-large_default/specchio-tascabile-giapponese-in-fiore-di-prugna-in-chirimen-kokoro-kagami-colore-tra-cui-scegliere.jpg";

      case "shirt":
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd5NI7bSLkD0AZscZv74CHXUoCpJLBr7n7yYA3q2OV3m7sngBwu6hg-DJM&s=10";

      default:
        return "https://images.freepik.com/japan-aesthetic-default.jpg";
    }
  };

  const getCategoryName = (key: string) => {
    switch (key) {
      case "figure":
        return "Figure";
      case "accessory":
        return "Accessory";
      case "shirt":
        return "Shirt";
      default:
        return key;
    }
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonState title="Categories Sections" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <ErrorState
          onRetry={refetch}
          title="category"
          assets={errorAnimation}
        />
      </div>
    );
  }

  return (
    <section id="categories" className="py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
            カテゴリー
          </p>
          <h2
            className="font-display text-[#1A1A1A] leading-tight"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Browse by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((cat) => (
            <motion.a key={cat.key}>
              <img className="w-full h-full object-cover flex gap-10 justify-center" src={getCategoryImage(cat.key)} />
              <h3 className="font-semibold text-2xl">{getCategoryName(cat.key)}</h3>
              <span className="text-xl font-semibold">{cat.count} items</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
