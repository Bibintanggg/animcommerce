"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="mb-12 lg:mb-16">
          <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
            お客様の声
          </p>
          <h2
            className="font-display text-[#1A1A1A] leading-tight"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            What Collectors Say
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white p-6 border border-[#E5E3DF] hover:border-[#BC002D]/30 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={12} className="fill-[#BC002D] text-[#BC002D]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#5C5C5C] text-sm leading-relaxed mb-5">
                "{t.text}"
              </p>

              {/* Product tag */}
              <p className="text-[#BC002D] text-xs tracking-wide mb-4 font-medium line-clamp-1">
                {t.product}
              </p>

              {/* Reviewer */}
              <div className="pt-4 border-t border-[#F5F4F0] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EEECE8] flex items-center justify-center text-sm font-medium text-[#5C5C5C] flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1A1A1A]">{t.name}</p>
                  <p className="text-xs text-[#9A9A9A]">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
