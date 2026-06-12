"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 lg:py-32 bg-[#1A1A1A] relative overflow-hidden">
      {/* Ambient character */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="text-white/[0.04] font-display leading-none"
          style={{ fontSize: "clamp(200px, 25vw, 400px)", fontWeight: 400 }}
        >
          愛
        </span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-5">
              ニュースレター
            </p>
            <h2
              className="font-display text-white leading-tight mb-5"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              Stay Ahead of
              <br />
              the Collection.
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              New drops, exclusive releases, and limited edition figures — delivered to your inbox before anyone else.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-white"
              >
                <div className="w-8 h-8 bg-[#BC002D] flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <p className="text-sm">
                  Welcome to the NIHON community. Check your inbox.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-3.5 text-sm focus:outline-none focus:border-white/50 transition-colors"
                />
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 bg-[#BC002D] text-white px-6 py-3.5 text-sm font-medium tracking-wide hover:bg-[#8A0020] transition-colors duration-300 whitespace-nowrap"
                >
                  Subscribe
                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            )}

            <p className="mt-4 text-white/30 text-xs">
              No spam. Unsubscribe anytime. Sent from Osaka with 愛.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
