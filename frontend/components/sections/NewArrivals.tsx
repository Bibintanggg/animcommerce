"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { getNewArrivals } from "@/services/product.service";

export default function NewArrivals() {
  const { data } = useQuery({
    queryKey: ["new-arrival"],
    queryFn: getNewArrivals
  })

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="new-arrivals" className="py-20 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-[1440px] mx-auto">
        <div className="px-6 lg:px-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div>
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
              新着商品
            </p>
            <h2
              className="font-display text-[#1A1A1A] leading-tight"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              New Arrivals
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-[#E5E3DF] flex items-center justify-center hover:border-[#BC002D] hover:text-[#BC002D] transition-all duration-200"
              aria-label="Scroll left"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-[#E5E3DF] flex items-center justify-center hover:border-[#BC002D] hover:text-[#BC002D] transition-all duration-200"
              aria-label="Scroll right"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto scroll-hide px-6 lg:px-12 pb-4"
        >
          {data?.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="flex-none w-[220px] sm:w-[260px] lg:w-[280px]"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
