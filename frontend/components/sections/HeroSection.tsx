"use client";

import { addToCart } from "@/services/cart.service";
import { getHeroBanner } from "@/services/product.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Boxes, Gem, Shirt, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SuccessModal from "../SuccessModal";
import ErrorModal from "../ErrorModal";
import axios from "axios";

interface AddToCartVariables {
  productId: number;
  productTitle: string;
}

export default function HeroSection() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["hero-products"],
    queryFn: getHeroBanner,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const queryClient = useQueryClient();
  const [cartSuccessModal, setCartSuccessModal] = useState(false);
  const [cartErrorModal, setCartErrorModal] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    if (!data || data.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  const addToCartMutation = useMutation({
    mutationFn: ({ productId }: AddToCartVariables) =>
      addToCart({
        product_id: productId,
        quantity: 1,
      }),

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart"],
      });

      window.dispatchEvent(new Event("cart-updated"));

      setCartMessage(
        `${variables.productTitle} berhasil ditambahkan ke keranjang.`,
      );

      setCartSuccessModal(true);
    },

    onError: (error: unknown) => {
      let message = "Terjadi kesalahan. Silakan coba lagi.";

      if (
        axios.isAxiosError<{
          message?: string;
        }>(error)
      ) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message;

        if (status === 401) {
          message =
            "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.";
        } else if (status === 400) {
          message =
            serverMessage ?? "Produk tidak dapat ditambahkan ke keranjang.";
        } else if (status === 404) {
          message = "Produk tidak ditemukan.";
        } else if (status === 409) {
          message =
            serverMessage ??
            "Jumlah produk di keranjang sudah mencapai batas stok.";
        } else if (status === 422) {
          message = serverMessage ?? "Data produk tidak valid.";
        } else if (status === 500) {
          message = "Terjadi kesalahan pada server.";
        } else if (!error.response) {
          message = "Tidak dapat terhubung ke server.";
        } else {
          message = serverMessage ?? "Gagal menambahkan produk ke keranjang.";
        }
      }

      setCartMessage(message);
      setCartErrorModal(true);
    },
  });

  const handleAddToCart = (productId: number, productTitle: string) => {
    addToCartMutation.mutate({
      productId,
      productTitle,
    });
  };
  const categories = [
    {
      name: "Figure",
      jp: "フィギュア",
      href: "#figure",
      icon: Boxes,
      accent: "#E85D04",
      soft: "bg-[#FFF7ED]",
      border: "border-[#FED7AA]",
    },
    {
      name: "Accessory",
      jp: "アクセサリー",
      href: "#accessory",
      icon: Gem,
      accent: "#0F766E",
      soft: "bg-[#F0FDFA]",
      border: "border-[#99F6E4]",
    },
    {
      name: "T-Shirt",
      jp: "Tシャツ",
      href: "#tshirt",
      icon: Shirt,
      accent: "#5B21B6",
      soft: "bg-[#F5F3FF]",
      border: "border-[#DDD6FE]",
    },
  ];

  return (
    <section className="relative bg-[#F4F3F0] overflow-visible">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-28 lg:pt-32 pb-10 lg:pb-14">
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
          {data && data.length > 0 && (
            <AnimatePresence mode="wait">
              {(() => {
                const product = data[activeIndex];

                if (!product) return null;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Main Stage */}
                    <motion.div
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="relative w-full aspect-[16/10] lg:aspect-[21/9] overflow-hidden bg-[#E8E6E1]"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover object-center"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
                        <div className="max-w-2xl">
                          <motion.p
                            key={`label-${product.id}`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-white/70 text-xs tracking-[0.2em] uppercase mb-3"
                          >
                            Limited Studio Release
                          </motion.p>

                          <motion.h1
                            key={`title-${product.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="font-display text-white leading-[0.9] tracking-tight mb-5 max-w-[700px]"
                            style={{
                              fontSize: "clamp(36px, 5.5vw, 52px)",
                              fontWeight: 500,
                            }}
                          >
                            {product.title}
                          </motion.h1>

                          <motion.div
                            key={`buttons-${product.id}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex flex-wrap items-center gap-4"
                          >
                            <button
                              onClick={() =>
                                router.push(`/products/${product.slug}`)
                              }
                              className="inline-flex items-center gap-2.5 bg-white text-[#111] px-6 py-3.5 text-sm font-medium tracking-wide hover:bg-[#BC002D] hover:text-white transition-colors duration-300"
                            >
                              Shop the Drop
                              <ArrowRight size={15} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/products/${product.slug}#details`)
                              }
                              className="text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white"
                            >
                              View Details
                            </button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bottom Info Strip */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="mt-6 lg:mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                    >
                      <div>
                        <p className="text-[#BC002D] text-[11px] tracking-[0.18em] uppercase mb-1">
                          Featured Piece
                        </p>

                        <h2 className="text-[#111] text-lg lg:text-xl font-medium tracking-tight">
                          {product.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[#9A9A9A] text-xs tracking-wide mb-0.5">
                            Price
                          </p>

                          <p className="text-[#111] text-lg font-medium">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart(product.id, product.title)
                          }
                          disabled={
                            addToCartMutation.isPending || product.stock <= 0
                          }
                          className="
    px-5 py-3
    border border-[#111]
    text-[#111] text-sm font-medium
    hover:bg-[#111] hover:text-white
    disabled:cursor-not-allowed
    disabled:opacity-50
    transition-colors duration-300
  "
                        >
                          {product.stock <= 0
                            ? "Out of Stock"
                            : addToCartMutation.isPending
                              ? "Adding..."
                              : "Add to Cart"}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          )}
        </div>

        {/* ===== 4 GRID CATEGORY + DISKON ===== */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-12 lg:mt-16 -mb-28 lg:-mb-40"
        >
          {/* Soft floating container */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 lg:p-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-[#E8E6E1]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-2.5">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <a
                    key={cat.name}
                    href={cat.href}
                    className={`
            group relative flex flex-col
            min-h-[118px] lg:min-h-[132px]
            p-4 lg:p-5
            rounded-xl
            ${cat.soft}
            border ${cat.border}
            transition-all duration-500 ease-out
            hover:-translate-y-1.5 hover:shadow-md
            overflow-hidden
          `}
                  >
                    {/* Soft corner accent */}
                    <div
                      className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ backgroundColor: cat.accent }}
                    />

                    {/* Top row: icon + small index */}
                    <div className="relative flex items-center justify-between mb-auto">
                      <div
                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center shadow-sm
                         group-hover:scale-110 transition-transform duration-400"
                      >
                        <Icon
                          size={15}
                          strokeWidth={2.2}
                          style={{ color: cat.accent }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-medium tracking-widest opacity-40"
                        style={{ color: cat.accent }}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="relative mt-3">
                      <p className="text-[13px] lg:text-sm font-semibold text-[#1A1A1A] tracking-wide">
                        {cat.name}
                      </p>
                      <p className="text-[10px] text-[#8A8A8A] tracking-[0.14em] mt-0.5">
                        {cat.jp}
                      </p>
                    </div>

                    {/* Thin bottom line that grows on hover */}
                    <div
                      className="absolute bottom-0 left-4 right-4 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ backgroundColor: cat.accent }}
                    />
                  </a>
                );
              })}

              <a
                href="#promo"
                className="group relative flex flex-col items-center justify-center py-6 lg:py-7 overflow-hidden
              bg-gradient-to-br from-[#D8002F] via-[#BC002D] to-[#8E0022] text-white"
              >
                {/* Decorative SVG - dashed ticket edge */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <circle cx="0" cy="50" r="10" fill="#F4F3F0" />
                  <circle cx="200" cy="50" r="10" fill="#F4F3F0" />
                </svg>

                {/* Animated sparkle - top right */}
                <motion.svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute top-2.5 right-3 w-3.5 h-3.5 text-white/70"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z"
                    fill="currentColor"
                  />
                </motion.svg>

                {/* Animated sparkle - bottom left, delayed */}
                <motion.svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute bottom-3 left-3 w-2.5 h-2.5 text-white/50"
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }}
                >
                  <path
                    d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z"
                    fill="currentColor"
                  />
                </motion.svg>

                {/* Soft glow blob */}
                <motion.div
                  className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/10 blur-xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Icon with subtle bounce */}
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative mb-2"
                >
                  <Ticket size={20} strokeWidth={1.8} className="text-white" />
                </motion.div>

                <span className="relative text-sm font-semibold tracking-wide">
                  Diskon 15%
                </span>
                <span className="relative text-[10px] text-white/80 tracking-wider mt-0.5 border border-white/30 rounded-full px-2 py-0.5 group-hover:bg-white group-hover:text-[#BC002D] transition-colors duration-300">
                  JAPAN15
                </span>
              </a>
            </div>
          </div>
        </motion.div>

        <SuccessModal
          isOpen={cartSuccessModal}
          title="Berhasil ditambahkan"
          subtitle={cartMessage}
          buttonText="Lihat Keranjang"
          onClose={() => {
            setCartSuccessModal(false);
            router.push("/cart");
          }}
        />

        <ErrorModal
          isOpen={cartErrorModal}
          title="Gagal menambahkan produk"
          subtitle={cartMessage}
          buttonText="Tutup"
          onClose={() => setCartErrorModal(false)}
        />
      </div>
    </section>
  );
}
