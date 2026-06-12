import { featuredProducts } from "@/lib/data";
import ProductCard from "@/components/common/ProductCard";

export default function FeaturedCollection() {
  return (
    <section id="featured" className="py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
              厳選コレクション
            </p>
            <h2
              className="font-display text-[#1A1A1A] leading-tight"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Featured Collection
            </h2>
          </div>
          <a
            href="#"
            className="group inline-flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors pb-1 border-b border-[#E5E3DF] hover:border-[#1A1A1A] self-start sm:self-end"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
        </div>

        {/* Grid — asymmetric layout: first item larger */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={index === 0 ? "col-span-2 lg:col-span-1 lg:row-span-1" : ""}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
