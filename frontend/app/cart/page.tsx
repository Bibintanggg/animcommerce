"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart, recommendProduct, removeCartItem, updateCartQuantity } from "@/services/cart.service";
import { CartItem } from "@/types/cart-product";
import { ProductCategory } from "@/enums/product-category";
import { Product } from "@/types/product";
import { number } from "framer-motion";
import { applyDiscount } from "@/services/product.service";


const CATEGORIES = [
  { id: "accessory", label: ProductCategory.AccessoryCategory },
  { id: "figure", label: ProductCategory.FigureCategry },
  { id: "shirt", label: ProductCategory.ShirtCategory },
];

export default function CartPage() {
  const { data: cart = [], isLoading } = useQuery({
    queryKey: ['get-cart'],
    queryFn: getCart,
  })

  const { data: recommended = [] } = useQuery<Product[]>({
    queryKey: ['recommend'],
    queryFn: async () => {
      const response = await recommendProduct();
      return Array.isArray(response) ? response : response.data ?? [];
    },
  });

  const queryClient = useQueryClient()

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    if (cart.length > 0) {
      setSelectedIds(cart.map((item) => item.id));
    }
  }, [cart]);

  const updateQtyMutation = useMutation({
    mutationFn: ({
      id,
      quantity,
    }: {
      id: number;
      quantity: number;
    }) => updateCartQuantity({ product_id: id, quantity }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-cart"],
      });
    },
  });

  const deleteCartMutation = useMutation({
    mutationFn: (productId: number) => removeCartItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-cart']
      })
    }
  })

  const removeCart = (productId: number) => {
    deleteCartMutation.mutate(productId)
  }

  const format = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCart.map((i) => i.id));
    }
  };

  const filteredCart = useMemo(() => {
    return cart.filter((item) => {
      const matchSearch = item.product.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.product.category);

      return matchSearch && matchCategory;
    });
  }, [cart, search, selectedCategories]);

  // Hanya item yang di-centang
  const selectedItems = cart.filter((item) => selectedIds.includes(item.id));

  const updateQty = (id: number, delta: number, currentQty: number) => {
    const newQuantity = Math.max(1, currentQty + delta);

    updateQtyMutation.mutate({
      id,
      quantity: newQuantity,
    });
  };

  const subtotal = selectedItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discount = appliedPromo?.discount ?? 0;
  const shipping = subtotal >= 500000 ? 0 : selectedItems.length > 0 ? 25000 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  // const handleApplyPromo = () => {
  //   setPromoError("");
  //   if (!promoCode.trim()) {
  //     setPromoError("Masukkan kode promo");
  //     return;
  //   }
  //   if (promoCode.toUpperCase() === "DISKON10") {
  //     setAppliedPromo({
  //       code: "DISKON10",
  //       discount: Math.floor(subtotal * 0.1),
  //     });
  //   } else {
  //     setAppliedPromo(null);
  //     setPromoError("Kode promo tidak valid");
  //   }
  // };

  const applyVoucherMutation = useMutation({
    mutationFn: applyDiscount,
    onSuccess: (data) => {
      setAppliedPromo({
        code: data.code,
        discount: data.discount
      })

      setPromoError("")
    },

    onError: (error: any) => {
      setAppliedPromo(null);
      setPromoError(
        error.response?.data?.message ??
        "Voucher tidak dapat digunakan"
      );
    },
  })

  const handleApplyPromo = () => {
    setPromoError("")
    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo")
      return
    }

    applyVoucherMutation.mutate({
      code: promoCode.trim(),
      subtotal
    })
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa]">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Keranjang kosong
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Belum ada produk yang ditambahkan
          </p>
          <Link
            href="/"
            className="inline-flex mt-8 h-11 px-7 items-center rounded-2xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Keranjang
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {cart.length} item · {selectedIds.length} dipilih
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ========== KIRI — Filter + You may also like ========== */}
          <aside className="lg:col-span-3 space-y-5">
            {/* FILTER */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari di keranjang..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-black transition"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="p-4">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase mb-3">
                  Kategori
                </p>
                <div className="space-y-2.5">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-black"
                      />
                      <span className="first-letter:uppercase text-sm text-gray-600 group-hover:text-gray-900">
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>

                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="mt-3 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            </div>

            {/* YOU MAY ALSO LIKE */}
            <div>
              <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
                You may also like
              </p>
              <div className="space-y-2.5">
                {recommended.slice(0, 5).map((item: Product) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="group flex gap-3 p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(item.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ========== TENGAH — Cart Items (selectable) ========== */}
          <main className="lg:col-span-5 xl:col-span-6 space-y-3">
            {/* Select all */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    filteredCart.length > 0 &&
                    selectedIds.length === filteredCart.length
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 accent-black"
                />
                <span className="text-sm text-gray-600">
                  Pilih semua ({filteredCart.length})
                </span>
              </label>
            </div>

            {filteredCart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  Tidak ada produk
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coba ubah filter atau kata kunci
                </p>
              </div>
            ) : (
              filteredCart.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className={`group flex gap-4 p-4 sm:p-5 rounded-[24px] border bg-white transition-all ${isSelected
                      ? "border-gray-300 shadow-sm"
                      : "border-gray-100 opacity-70"
                      }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                      />
                    </div>

                    {/* Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50"
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-medium text-gray-900 text-[15px] hover:underline underline-offset-2"
                          >
                            {item.product.title}
                          </Link>

                          <p className="text-xs text-gray-400 mt-1">
                            {item.product.description}
                          </p>
                        </div>

                        <div className="flex-col gap-10 items-end">
                          <button
                            type="button"
                            onClick={() => removeCart(item.product.id)}
                            disabled={deleteCartMutation.isPending}
                            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>

                          <p className="text-xs text-gray-400 mt-1">
                            Stock : {item.product.stock}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl bg-gray-50 border border-gray-100">
                          <button
                            type="button"
                            onClick={() => updateQty(item.product.id, -1, item.quantity)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black text-sm"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.product.id, 1, item.quantity)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black text-sm"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-semibold text-gray-900 text-[15px]">
                          {format(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </main>

          {/* ========== KANAN — Checkout (hanya selected) ========== */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Ringkasan
                </h2>
                <p className="text-xs text-gray-400 mb-5">
                  {selectedItems.length} item dipilih
                </p>

                {/* Promo */}
                <div className="mb-5">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          {appliedPromo.code}
                        </p>
                        <p className="text-xs text-green-600">
                          −{format(appliedPromo.discount)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode("");
                        }}
                        className="text-xs text-red-500 font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError("");
                        }}
                        placeholder="Kode promo"
                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm outline-none focus:bg-white focus:border-black transition"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={applyVoucherMutation.isPending}
                        className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-black transition"
                      >
                        {applyVoucherMutation.isPending ? "Memeriksa..." : "Pakai"}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                  )}
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{format(subtotal)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>−{format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pengiriman</span>
                    <span
                      className={
                        shipping === 0
                          ? "text-green-600 font-medium"
                          : "font-medium"
                      }
                    >
                      {shipping === 0 ? "Gratis" : format(shipping)}
                    </span>
                  </div>
                </div>

                {shipping > 0 && selectedItems.length > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (subtotal / 500000) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Tambah {format(500000 - subtotal)} lagi untuk gratis ongkir
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-end border-t border-gray-100 mt-5 pt-5">
                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-semibold tracking-tight">
                    {format(total)}
                  </span>
                </div>

                <button
                  disabled={selectedItems.length === 0}
                  className="w-full mt-6 h-12 rounded-2xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Checkout ({selectedItems.length})
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-3">
                  Pembayaran aman · Garansi 30 hari
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}