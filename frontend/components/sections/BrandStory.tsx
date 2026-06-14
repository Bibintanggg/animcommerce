"use client";

import { motion } from "framer-motion";

export default function BrandStory() {
  return (
    <section id="story" className="py-20 lg:py-40 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=90"
                alt="Japanese culture"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Offset accent box */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-[#BC002D]/25 -z-10 hidden lg:block" />
            {/* Small quote float */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -right-8 top-1/3 bg-white p-5 shadow-sm border border-[#E5E3DF] max-w-[180px] hidden xl:block"
            >
              <p className="font-display text-3xl text-[#BC002D] mb-1">魂</p>
              <p className="text-xs text-[#9A9A9A] leading-relaxed">
                Tamashii — the spirit within every creation
              </p>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-5">
              私たちについて
            </p>
            <h2
              className="font-bold text-[#1A1A1A] leading-tight mb-8"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Rooted in
              <br />
              Japanese Philosophy
            </h2>

            <div className="space-y-5 text-[#5C5C5C] text-base leading-relaxed">
              <p>
                NIHON was founded on a simple belief: that anime and manga are not just entertainment — they are a living cultural art form, deserving the same reverence as any museum-quality piece.
              </p>
              <p>
                We source directly from Japan's most celebrated studios and artisans, each piece authenticated before it reaches you. From hand-painted scale figures to first-edition manga, every item carries the spirit of its origin.
              </p>
              <p>
                The Japanese concept of <em className="text-[#1A1A1A] font-medium">Monozukuri</em> — the art of making things with dedication and craftsmanship — guides everything we do. We don't just sell merchandise. We preserve moments in time.
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-[#E5E3DF] grid grid-cols-2 gap-8">
              {[
                { value: "2018", label: "Founded in Osaka" },
                { value: "100%", label: "Authenticity Guaranteed" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="font-display text-3xl text-[#1A1A1A] mb-1">
                    {item.value}
                  </div>
                  <div className="text-xs text-[#9A9A9A] tracking-wide">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="group inline-flex items-center gap-3 mt-10 text-sm font-medium text-[#1A1A1A] hover:text-[#BC002D] transition-colors"
            >
              Read our full story
              <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
