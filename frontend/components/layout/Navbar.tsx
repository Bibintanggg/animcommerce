"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#featured", label: "Collection" },
    { href: "#categories", label: "Categories" },
    { href: "#new-arrivals", label: "New Arrivals" },
    { href: "#best-sellers", label: "Best Sellers" },
    { href: "#story", label: "Our Story" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#E5E3DF]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <span className="text-[#BC002D] font-display text-xl font-medium tracking-widest">
                日本
              </span>
              <div className="h-5 w-px bg-[#E5E3DF]" />
              <span
                className="text-[#1A1A1A] font-semibold tracking-[0.2em] uppercase text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ANIMCOMMERCE
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm tracking-wide transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#BC002D] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                aria-label="Search"
                className="p-2 text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors duration-200 hidden sm:block"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                aria-label="Wishlist"
                className="p-2 text-[#5C5C5C] hover:text-[#BC002D] transition-colors duration-200 hidden sm:block"
              >
                <Heart size={18} strokeWidth={1.5} />
              </button>
              <button
                aria-label="Cart"
                className="relative p-2 text-[#1A1A1A] hover:text-[#BC002D] transition-colors duration-200"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#BC002D] rounded-full" />
              </button>
              <button
                className="lg:hidden p-2 text-[#1A1A1A]"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5E3DF]">
                <span className="font-semibold tracking-[0.2em] uppercase text-sm">
                  NIHON
                </span>
                <button onClick={() => setMenuOpen(false)} className="p-2">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-[#1A1A1A] text-base border-b border-[#F5F4F0] hover:text-[#BC002D] transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mt-auto p-6">
                <p className="text-[#9A9A9A] text-xs tracking-widest uppercase">
                  日本 — Crafted in Japan
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
