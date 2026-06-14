"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "horizontal";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [isWished, setIsWished] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden bg-[#F7F6F3] aspect-[3/4]">
        {/* Badge: Category */}
        {product.category && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-medium tracking-wider uppercase bg-[#1A1A1A] text-white">
            {product.category}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-medium tracking-wider uppercase bg-[#BC002D] text-white">
            Habis
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWished(!isWished);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={cn(
              "transition-colors duration-200",
              isWished ? "fill-[#BC002D] text-[#BC002D]" : "text-[#1A1A1A]"
            )}
          />
        </button>

        <div className="w-full h-full overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#EEECE8] animate-pulse" />
          )}
        </div>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            disabled={isOutOfStock}
            className={cn(
              "w-full text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-200 py-1",
              isOutOfStock
                ? "text-[#9A9A9A] cursor-not-allowed"
                : "text-[#1A1A1A] hover:text-[#BC002D]"
            )}
          >
            {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3">
        <p className="text-[#BC002D] text-xs tracking-widest mb-1 font-bold uppercase">
          {product.category}
        </p>
        <h3 className="text-[#1A1A1A] text-sm font- leading-snug mb-2 group-hover:text-[#BC002D] transition-colors duration-200 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-[#9A9A9A] text-xs leading-relaxed mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#1A1A1A] text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
          <span className="text-[#9A9A9A] text-xs">
            Stok: {product.stock}
          </span>
        </div>
      </div>
    </motion.div>
  );
}