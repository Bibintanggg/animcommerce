"use client";

import { motion } from "framer-motion";
// import { categories } from "@/lib/data";

export default function CategoriesSection() {
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

        {/* Category Grid — asymmetric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href="#"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden bg-[#F7F6F3] block"
              style={{ aspectRatio: i === 0 || i === 3 ? "3/4" : "3/4" }}
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 ease-out"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <p className="text-white/60 text-xs tracking-widest mb-1 font-medium">
                  {cat.nameJp}
                </p>
                <h3 className="text-white font-display text-xl lg:text-2xl font-medium mb-1">
                  {cat.name}
                </h3>
                <p className="text-white/60 text-xs mb-3 line-clamp-1">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">
                    {cat.count} items
                  </span>
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    Shop →
                  </span>
                </div>
              </div>

              {/* Border accent on hover */}
              <div className="absolute inset-0 border-2 border-[#BC002D] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
