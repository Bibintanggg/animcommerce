"use client";

import ProductCard from "@/components/common/ProductCard";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";
import { ErrorCard } from "../home-alert";
import ErrorState from "../states/ErrorStates";
import LoadingState from "../states/LoadingState";
import errorAnimation from "../../public/assets/lottie/notfound-error.json";

export default function FeaturedCollection() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  if (isLoading) {
    return <div>
      <LoadingState />
    </div>;
  }

  if (error) {
    return (
      <div className="p-10">
        <ErrorState onRetry={refetch} title="product" assets={errorAnimation} />
      </div>
    )
  }

  return (
    <section id="featured" className="py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
              厳選コレクション
            </p>
            <h2
              className="font-bold text-[#1A1A1A] leading-tight"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Featured Collection
            </h2>
          </div>
          <a
            href="#"
            className="group font- inline-flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors pb-1 border-b border-[#E5E3DF] hover:border-[#1A1A1A] self-start sm:self-end"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {data?.map((product, index) => (
            <div
              key={product.id}
              className={index === 0 ? "col-span-2 lg:col-span-1" : ""}
            >

              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
