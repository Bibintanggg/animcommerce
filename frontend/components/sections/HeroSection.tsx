"use client";

import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";

export default function HeroSection() {
  const categories = [
    { name: "Figure", jp: "フィギュア", href: "#figure" },
    { name: "Accessory", jp: "アクセサリー", href: "#accessory" },
    { name: "T-Shirt", jp: "Tシャツ", href: "#tshirt" },
  ];

  return (
    <section className="relative bg-[#F4F3F0] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-28 lg:pt-32 pb-10">
        
        {/* Top Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10 lg:mb-14"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC002D]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#6B6B6B]">
              New Drop · Summer 2026
            </span>
          </div>
          <span className="hidden sm:block text-[11px] tracking-[0.18em] uppercase text-[#9A9A9A]">
            日本直送
          </span>
        </motion.div>

        {/* Main Stage */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[16/10] lg:aspect-[21/9] overflow-hidden bg-[#E8E6E1]"
          >
            <img
              src="https://images.unsplash.com/photo-1608889175638-9322300c369e?w=1400&q=90"
              alt="Featured Japanese collectible"
              className="w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

            {/* Campaign Text */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
              <div className="max-w-2xl">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-white/70 text-xs tracking-[0.2em] uppercase mb-3"
                >
                  Limited Studio Release
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="font-display text-white leading-[1.05] tracking-tight mb-5"
                  style={{ fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 500 }}
                >
                  Crafted in Japan.
                  <br />
                  <span className="text-white/90">Owned Worldwide.</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <a
                    href="#shop"
                    className="inline-flex items-center gap-2.5 bg-white text-[#111] px-6 py-3.5 text-sm font-medium tracking-wide hover:bg-[#BC002D] hover:text-white transition-colors duration-300"
                  >
                    Shop the Drop
                    <ArrowRight size={15} strokeWidth={2} />
                  </a>
                  <a
                    href="#details"
                    className="text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white"
                  >
                    View Details
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Info Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 lg:mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div>
              <p className="text-[#BC002D] text-[11px] tracking-[0.18em] uppercase mb-1">
                Featured Piece
              </p>
              <h2 className="text-[#111] text-lg lg:text-xl font-medium tracking-tight">
                Demon Slayer — Tanjiro Kamado
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-1">
                1/7 Scale · Official Bandai Spirits
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[#9A9A9A] text-xs tracking-wide mb-0.5">Price</p>
                <p className="text-[#111] text-lg font-medium">Rp 1.890.000</p>
              </div>
              <button className="px-5 py-3 border border-[#111] text-[#111] text-sm font-medium hover:bg-[#111] hover:text-white transition-colors duration-300">
                Add to Cart
              </button>
            </div>
          </motion.div>
        </div>

        {/* ===== 4 GRID CATEGORY + DISKON ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          {/* Category 1-3 */}
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center justify-center py-8 lg:py-10 bg-white border border-[#E8E6E1] hover:border-[#BC002D]/40 hover:shadow-sm transition-all duration-300"
            >
              <span className="w-2 h-2 rounded-full bg-[#BC002D] mb-4 group-hover:scale-125 transition-transform" />
              <span className="text-[#111] text-sm font-medium tracking-wide">
                {cat.name}
              </span>
              <span className="text-[11px] text-[#9A9A9A] tracking-wider mt-1">
                {cat.jp}
              </span>
            </a>
          ))}

          {/* Grid 4 - Diskon / Voucher */}
          <div className="flex flex-col items-center justify-center py-8 lg:py-10 bg-[#BC002D] text-white">
            <Tag size={18} strokeWidth={1.8} className="mb-3" />
            <span className="text-sm font-medium tracking-wide">
              Diskon 15%
            </span>
            <span className="text-[11px] text-white/80 tracking-wider mt-1">
              KODE: JAPAN15
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}