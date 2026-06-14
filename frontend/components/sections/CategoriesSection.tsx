"use client";

import { getCategoriesItem, getProducts } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
// import { categories } from "@/lib/data";

export default function CategoriesSection() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  })

  const categories = useMemo(() => {
    if (!products) return [];

    const map: Record<string, number> = {};

    for (const p of products) {
      map[p.category] = (map[p.category] || 0) + 1;
    }

    return Object.entries(map).map(([key, count]) => ({
      key,
      count,
    }));
  }, [products]);

  const getCategoryImage = (key: string) => {
    switch (key) {
      case "figure":
        return "https://images.freepik.com/japan-anime-figure-aesthetic.jpg";

      case "accessory":
        return "https://images.freepik.com/japanese-accessories-aesthetic.jpg";

      case "shirt":
        return "/assets/shirt-japan.jpg";

      default:
        return "https://images.freepik.com/japan-aesthetic-default.jpg";
    }
  };

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
              <img src={getCategoryImage(cat.key)} />
              <h3>{cat.key}</h3>
              <span>{cat.count} items</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
