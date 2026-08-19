"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BrandStory() {
  return (
    <section id="story" className="py-24 lg:py-32 bg-[#FAFAF9]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=90"
                alt="Japanese culture"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#9A9A9A] mb-0.5">
                  Est.
                </p>
                <p className="font-display text-xl text-[#1A1A1A]">2018</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#9A9A9A] mb-0.5">
                  Origin
                </p>
                <p className="font-display text-xl text-[#1A1A1A]">Osaka</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 lg:pl-8"
          >
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-4">
              私たちについて
            </p>

            <h2
              className="font-display text-[#1A1A1A] leading-[1.15] mb-8"
              style={{ fontSize: "clamp(32px, 4.2vw, 48px)" }}
            >
              Crafted with
              <br />
              Japanese spirit
            </h2>

            <div className="space-y-5 text-[#5C5C5C] text-[15px] leading-[1.75] max-w-xl">
              <p>
                NIHON was built on a simple belief — anime and manga are not just
                entertainment. They are a living cultural art form that deserves
                the same respect as any museum piece.
              </p>
              <p>
                We work directly with studios and artisans across Japan. Every
                figure, every print, every accessory is authenticated before it
                reaches you.
              </p>
              <p>
                Guided by <span className="text-[#1A1A1A] font-medium">Monozukuri</span> —
                the spirit of making things with care and precision — we don’t
                just sell products. We preserve moments.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-10">
              {[
                { value: "100%", label: "Authentic" },
                { value: "2.4k+", label: "Collectors" },
                { value: "48h", label: "Ship worldwide" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl text-[#1A1A1A] mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#9A9A9A] tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 mt-12 text-sm font-medium text-[#1A1A1A] hover:text-[#BC002D] transition-colors"
            >
              Read our story
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}