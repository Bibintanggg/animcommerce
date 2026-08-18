"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";
import { getMe } from "@/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/services/cart.service";

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cartAnimating, setCartAnimating] = useState(false);

  const { data: cart = [] } = useQuery({
    queryKey: ['get-cart'],
    queryFn: getCart,
  })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartAnimating(true)
      const timer = setTimeout(() => {
        setCartAnimating(false)
      }, 600)
      return () => clearTimeout(timer)
    }

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  })

  // useEffect(() => {

  //   const storedUser = localStorage.getItem("user");

  //   if (storedUser) {
  //     const user = JSON.parse(storedUser);

  //     setIsLogin(true);
  //     setUserRole(user.role);
  //   }
  // }, []);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setIsLogin(false)
        setUserRole(null)
        return
      }

      try {
        const user = await getMe()
        setIsLogin(true)
        setUserRole(user.role)
      } catch {
        setIsLogin(false)
        setUserRole(null)
      }
    }

    checkSession()
  }, [])

  const navLinks = [
    { href: "/#featured", label: "Collection" },
    { href: "/#categories", label: "Categories" },
    { href: "/#new-arrivals", label: "New Arrivals" },
    { href: "/#best-sellers", label: "Best Sellers" },
    { href: "/#story", label: "Our Story" },

    ...(userRole === "admin" || userRole === "superadmin"
      ? [
        {
          href:
            userRole === "superadmin"
              ? "/superadmin/dashboard"
              : "/admin/dashboard",
          label: "Dashboard",
        },
      ]
      : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogin(false);
    setUserRole(null);
    router.push("/");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
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
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm tracking-wide transition-colors duration-200 relative group"
                >
                  {link.label}

                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#BC002D] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}

              {isLogin ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm tracking-wide"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm tracking-wide"
                >
                  Login
                </Link>
              )}
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
              <Link
                href="/cart"
                aria-label={`Cart (${cartCount} items)`}
                className="relative p-2 text-[#1A1A1A] hover:text-[#BC002D] transition-colors duration-200"
              >
                <motion.div
                  animate={
                    cartAnimating
                      ? {
                        rotate: [0, -12, 12, -8, 8, 0],
                        y: [0, -3, 0, -2, 0],
                      }
                      : {
                        rotate: 0,
                        y: 0,
                      }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                </motion.div>

                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#BC002D] text-white text-[9px] font-semibold flex items-center justify-center leading-none"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
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
                  <Link
                    href={link.href}
                    className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm tracking-wide transition-colors duration-200 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#BC002D] group-hover:w-full transition-all duration-300" />
                  </Link>
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
