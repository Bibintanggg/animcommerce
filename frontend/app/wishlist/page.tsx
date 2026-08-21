"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWishlist, removeWishlist } from "@/services/wishlist.service";
import { Wishlist } from "@/types/product-wishlist";
import axios from "axios";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";

interface DeleteWishlistVariables {
  wishlistId: number;
  productId: number;
}

interface BulkDeleteResult {
  deletedWishlistIds: number[];
  failedCount: number;
}

const MOCK_RECOMMENDED = [
  {
    id: 201,
    title: "Jujutsu Kaisen Hoodie",
    slug: "jjk-hoodie",
    price: 299000,
    thumbnail: "https://picsum.photos/id/1020/200/200",
  },
  {
    id: 202,
    title: "Demon Slayer Pin Set",
    slug: "demon-slayer-pin",
    price: 45000,
    thumbnail: "https://picsum.photos/id/1021/200/200",
  },
  {
    id: 203,
    title: "One Piece Poster",
    slug: "one-piece-poster",
    price: 89000,
    thumbnail: "https://picsum.photos/id/1022/200/200",
  },
];

const CATEGORIES = [
  { id: "accessory", label: "Accessory" },
  { id: "figure", label: "Figure" },
  { id: "shirt", label: "Shirt" },
];

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const {
    data: wish = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-wishlist"],
    queryFn: getWishlist,
    retry: false,
  });

  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState("");
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    setWishlist(wish);
    setSelectedIds(wish.map((item) => item.id));
  }, [wish]);

  const filteredWishlist = useMemo(() => {
    return wishlist.filter((item) => {
      const matchSearch = item.product.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.product.category);
      return matchSearch && matchCategory;
    });
  }, [wishlist, search, selectedCategories]);

  const format = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredWishlist.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredWishlist.map((i) => i.id));
    }
  };

  const selectedItems = wishlist.filter((item) =>
    selectedIds.includes(item.id),
  );

  // ===== Dummy handlers (ganti nanti) =====
  const handleRemove = (item: Wishlist) => {
    setDeleteError("");

    deleteWishlistMutation.mutate({
      wishlistId: item.id,
      productId: item.product.id,
    });
  };

  const handleBulkRemove = () => {
    if (selectedItems.length === 0) {
      setResultMessage("Pilih minimal satu item yang ingin dihapus.");
      setIsErrorModalOpen(true);
      return;
    }

    setIsBulkConfirmOpen(true);
  };

  const handleConfirmBulkRemove = () => {
    bulkDeleteWishlistMutation.mutate(selectedItems);
  };

  const handleAddToCart = (productId: number) => {
    console.log("Add to cart:", productId);
    // TODO: panggil service add to cart
  };

  const handleBulkAddToCart = () => {
    const productIds = selectedItems.map((i) => i.product.id);
    console.log("Bulk add to cart:", productIds);
    // TODO: panggil service
  };

  const deleteWishlistMutation = useMutation({
    mutationFn: ({ productId }: DeleteWishlistVariables) =>
      removeWishlist(productId),

    onSuccess: async (message, variables) => {
      setDeleteError("");

      // Langsung hapus dari UI
      setWishlist((previous) =>
        previous.filter((item) => item.id !== variables.wishlistId),
      );

      // Hapus juga dari daftar pilihan
      setSelectedIds((previous) =>
        previous.filter((id) => id !== variables.wishlistId),
      );

      // Ambil ulang data terbaru dari backend
      await queryClient.invalidateQueries({
        queryKey: ["get-wishlist"],
      });

      console.log(message);
    },

    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setDeleteError("Produk tidak ditemukan di wishlist");
          return;
        }

        if (error.response?.status === 401) {
          setDeleteError("Silakan login untuk mengubah wishlist");
          return;
        }

        setDeleteError(
          error.response?.data?.message ?? "Gagal menghapus wishlist",
        );

        return;
      }

      setDeleteError("Terjadi kesalahan");
    },
  });

  const bulkDeleteWishlistMutation = useMutation({
    mutationFn: async (items: Wishlist[]): Promise<BulkDeleteResult> => {
      const results = await Promise.allSettled(
        items.map((item) => removeWishlist(item.product.id)),
      );

      const deletedWishlistIds: number[] = [];
      let failedCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          deletedWishlistIds.push(items[index].id);
        } else {
          failedCount++;
        }
      });

      return {
        deletedWishlistIds,
        failedCount,
      };
    },

    onSuccess: async ({ deletedWishlistIds, failedCount }) => {
      setIsBulkConfirmOpen(false);

      setWishlist((previous) =>
        previous.filter((item) => !deletedWishlistIds.includes(item.id)),
      );

      setSelectedIds((previous) =>
        previous.filter((id) => !deletedWishlistIds.includes(id)),
      );

      await queryClient.invalidateQueries({
        queryKey: ["get-wishlist"],
      });

      if (failedCount > 0) {
        setResultMessage(
          `${deletedWishlistIds.length} item berhasil dihapus, tetapi ${failedCount} item gagal dihapus.`,
        );

        setIsErrorModalOpen(true);
        return;
      }

      setResultMessage(
        `${deletedWishlistIds.length} item berhasil dihapus dari wishlist.`,
      );

      setIsSuccessModalOpen(true);
    },

    onError: () => {
      setIsBulkConfirmOpen(false);
      setResultMessage("Wishlist gagal dihapus. Silakan coba kembali.");
      setIsErrorModalOpen(true);
    },
  });

  if (isLoading) {
    return <p>Memuat Wishlist...</p>;
  }

  if (isError) {
    return <p>Gagal Megambil wishlist...</p>;
  }

  // ===== EMPTY STATE =====
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa]">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Wishlist kosong
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Belum ada produk yang kamu simpan
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
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {wishlist.length} item · {selectedIds.length} dipilih
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkAddToCart}
                className="h-10 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                Tambah ke Keranjang ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={handleBulkRemove}
                disabled={bulkDeleteWishlistMutation.isPending}
                className="
    h-10 px-4 rounded-xl
    border border-gray-200 bg-white
    text-sm font-medium text-gray-700
    hover:border-red-200 hover:bg-red-50
    hover:text-red-600
    disabled:cursor-not-allowed disabled:opacity-50
    transition
  "
              >
                Hapus ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ========== KIRI — Filter + Recommended ========== */}
          <aside className="lg:col-span-3 space-y-5">
            {/* FILTER */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                    placeholder="Cari di wishlist..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-black transition"
                  />
                </div>
              </div>

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
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">
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
                {MOCK_RECOMMENDED.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
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

          {/* ========== TENGAH — Wishlist Items ========== */}
          <main className="lg:col-span-9 space-y-3">
            {/* Select all */}

            {deleteError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {deleteError}
              </div>
            )}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    filteredWishlist.length > 0 &&
                    selectedIds.length === filteredWishlist.length
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 accent-black"
                />
                <span className="text-sm text-gray-600">
                  Pilih semua ({filteredWishlist.length})
                </span>
              </label>
            </div>

            {filteredWishlist.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  Tidak ada produk
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coba ubah filter atau kata kunci
                </p>
              </div>
            ) : (
              filteredWishlist.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className={`group flex gap-4 p-4 sm:p-5 rounded-[24px] border bg-white transition-all ${
                      isSelected
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
                      href={`/products/${item.product.slug}`}
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
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-gray-900 text-[15px] hover:underline underline-offset-2"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {item.product.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Stok: {item.product.stock}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={
                            deleteWishlistMutation.isPending &&
                            deleteWishlistMutation.variables?.wishlistId ===
                              item.id
                          }
                          className="
    shrink-0 w-8 h-8 rounded-xl
    flex items-center justify-center
    text-gray-300
    hover:text-red-500 hover:bg-red-50
    disabled:cursor-not-allowed disabled:opacity-40
    transition
  "
                        >
                          {deleteWishlistMutation.isPending &&
                          deleteWishlistMutation.variables?.wishlistId ===
                            item.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                          ) : (
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
                          )}
                        </button>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-[15px]">
                          {format(item.product.price)}
                        </p>

                        <button
                          onClick={() => handleAddToCart(item.product.id)}
                          className="h-9 px-4 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-black transition active:scale-[0.98]"
                        >
                          + Keranjang
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </main>

          <ConfirmModal
            isOpen={isBulkConfirmOpen}
            title="Hapus wishlist?"
            subtitle={`Kamu akan menghapus ${selectedItems.length} item dari wishlist. Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Hapus Semua"
            cancelText="Batal"
            isLoading={bulkDeleteWishlistMutation.isPending}
            onConfirm={handleConfirmBulkRemove}
            onClose={() => {
              if (!bulkDeleteWishlistMutation.isPending) {
                setIsBulkConfirmOpen(false);
              }
            }}
          />

          <SuccessModal
            isOpen={isSuccessModalOpen}
            title="Wishlist berhasil dihapus"
            subtitle={resultMessage}
            buttonText="Oke"
            onClose={() => setIsSuccessModalOpen(false)}
          />

          <ErrorModal
            isOpen={isErrorModalOpen}
            title="Wishlist gagal dihapus"
            subtitle={resultMessage}
            buttonText="Tutup"
            onClose={() => setIsErrorModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
