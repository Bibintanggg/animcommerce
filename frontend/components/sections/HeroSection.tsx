"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F7F6F3]">
      {/* Japanese character ambient — the signature element */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="text-[#EEECE8] font-display leading-none"
          style={{ fontSize: "clamp(280px, 35vw, 520px)", fontWeight: 400 }}
        >
          魂
        </span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
          {/* Text Content */}
          <div className="lg:col-span-6 xl:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#BC002D] font-medium">
                <span className="w-6 h-px bg-[#BC002D]" />
                Premium Japanese Merchandise
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[#1A1A1A] leading-[1.05] mb-6"
              style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
            >
              Where Anime
              <br />
              <em className="text-[#BC002D] not-italic">Becomes</em>
              <br />
              Art.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#5C5C5C] text-base lg:text-lg leading-relaxed max-w-sm mb-10"
            >
              Curated figures, manga, and collectibles sourced directly from Japan's most celebrated studios.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <a
                href="#featured"
                className="group inline-flex items-center gap-3 bg-[#BC002D] text-white px-7 py-4 text-sm font-medium tracking-wide hover:bg-[#8A0020] transition-colors duration-300"
              >
                Shop Now
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>
              <a
                href="#story"
                className="inline-flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors duration-200 py-4"
              >
                Our Story
                <span className="w-4 h-px bg-current" />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#E5E3DF]"
            >
              {[
                { value: "800+", label: "Products" },
                { value: "98%", label: "Authentic" },
                { value: "40+", label: "Countries" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl lg:text-3xl text-[#1A1A1A] font-medium">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#9A9A9A] tracking-wide mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-6 xl:col-span-7 lg:pl-16 xl:pl-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Main hero image */}
              <div className="relative aspect-[4/5] lg:aspect-[3/4] max-w-lg lg:max-w-none mx-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1608889175638-9322300c369e?w=900&q=90"
                  alt="Featured anime figure"
                  className="w-full h-full object-cover"
                />
                {/* Floating product info card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 border border-white/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#BC002D] text-xs tracking-widest font-medium mb-0.5">
                        鬼滅の刃
                      </p>
                      <p className="text-[#1A1A1A] text-sm font-semibold">
                        Demon Slayer Tanjiro
                      </p>
                      <p className="text-[#5C5C5C] text-xs mt-0.5">
                        Limited Edition Figure
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#1A1A1A] text-base font-semibold">
                        Rp 89.000
                      </p>
                      <button className="mt-1 text-xs text-[#BC002D] tracking-wide font-medium hover:underline">
                        Add to Cart →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Accent element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-[#BC002D]/30 -z-10 hidden lg:block" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[#BC002D] to-transparent"
        />
        <span className="text-xs text-[#9A9A9A] tracking-[0.2em] uppercase">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
