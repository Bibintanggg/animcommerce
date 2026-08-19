"use client";

import ProductCard from "@/components/common/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/services/product.service";
import ErrorState from "../states/ErrorStates";
import LoadingState from "../states/LoadingState";
import errorAnimation from "../../public/assets/lottie/notfound-error.json";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FeaturedCollection() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["featured-products"],
    queryFn: getFeaturedProducts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <ErrorState onRetry={refetch} title="product" assets={errorAnimation} />
      </div>
    );
  }

  const products = data ?? [];

  return (
    <section id="featured" className="py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-14">
          <div>
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
              厳選コレクション
            </p>
            <h2
              className="font-display text-[#1A1A1A] leading-tight"
              style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
            >
              Featured Collection
            </h2>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors self-start sm:self-end"
          >
            View all
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </Link>
        </div>

        {/* Grid - modern tapi proporsional */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={
                index === 0 || index === 5
                  ? "col-span-2 row-span-1"
                  : ""
              }
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}