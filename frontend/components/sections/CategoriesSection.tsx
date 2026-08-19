"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import SkeletonState from "../states/SkeletonStates";
import ErrorState from "../states/ErrorStates";
import errorAnimation from "../../public/assets/lottie/error-stress.json";
import { getAllProducts } from "@/services/product.service";
import { ProductCategory } from "@/enums/product-category";
import Link from "next/link";

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
        return "https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=800&auto=format&fit=crop&q=80";
      case "accessory":
        return "https://tsuru.fr/116979-large_default/specchio-tascabile-giapponese-in-fiore-di-prugna-in-chirimen-kokoro-kagami-colore-tra-cui-scegliere.jpg";
      case "shirt":
        return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80";
      default:
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80";
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
    <section id="categories" className="py-20 lg:py-32 bg-[#FAFAFA]">
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/products?category=${cat.key}`}
                className="group relative block overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={getCategoryImage(cat.key)}
                    alt={getCategoryName(cat.key)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-display text-2xl lg:text-3xl font-medium mb-1">
                    {getCategoryName(cat.key)}
                  </h3>
                  <p className="text-sm text-white/80 tracking-wide">
                    {cat.count} {cat.count === 1 ? "item" : "items"}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}