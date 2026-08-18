"use client";

import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import { getMe } from "@/services/auth.service";
import { addToCart } from "@/services/cart.service";
import { getProductDetails } from "@/services/product.service";
import {
  createReview,
  getProductReviews,
  updateReview,
} from "@/services/reviews.service";
import { Discount } from "@/types/product-discount";
import { Review } from "@/types/product-review";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { goeyToast } from "goey-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailProduct() {
  const params = useParams();
  const router = useRouter()
  const slug = params.slug as string;

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-products", slug],
    queryFn: () => getProductDetails(slug),
    enabled: !!slug,
  });

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: isLoadingReviews, error: reviewsError } = useQuery<Review[]>({
    queryKey: ["get-product-reviews", product?.id],
    queryFn: () => getProductReviews(product?.id as number),
    enabled: !!product?.id,
  });

  const recommended = [
    {
      id: 1,
      name: "Urban Sneaker X",
      price: 1599000,
      image:
        "https://images.unsplash.com/photo-1525966222134-fcfa4f85c945?w=400&q=80",
      rating: 4.7,
    },
    {
      id: 2,
      name: "Trail Flex 2.0",
      price: 2199000,
      image:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Classic Court Low",
      price: 1299000,
      image:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
      rating: 4.6,
    },
    {
      id: 4,
      name: "Motion Knit Elite",
      price: 1899000,
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
      rating: 4.8,
    },
  ];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("42");
  const [qty, setQty] = useState(1);

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(
    null
  );
  const [discountError, setDiscountError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Gagal mengirim ulasan. Silakan coba lagi."
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [failedModal, setFailedModal] = useState(false);

  const [cartSuccessModal, setCartSuccessModal] = useState(false);
  const [cartErrorModal, setCartErrorModal] = useState(false);
  const [cartErrorMessage, setCartErrorMessage] = useState(
    "Gagal menambahkan produk ke keranjang."
  );

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const myReview = reviews?.find((r) => r.user?.id === currentUser?.id);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.user?.id === currentUser?.id) return -1;
    if (b.user?.id === currentUser?.id) return 1;
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const handleStartEdit = (review: (typeof reviews)[number]) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setReviewError("");
    document
      .getElementById("review-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
  };

  const addToCartMutation = useMutation({
    mutationFn: addToCart,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
      window.dispatchEvent(new Event("cart-updated"));
      setCartSuccessModal(true);
    },

    onError: (error) => {
      console.error("Gagal menambahkan ke keranjang:", error);

      let message = "Terjadi kesalahan. Silakan coba lagi.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          message = "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.";
        } else if (status === 400) {
          message =
            error.response?.data?.message ||
            "Gagal menambahkan produk ke keranjang.";
        } else if (status === 404) {
          message = "Produk atau keranjang tidak ditemukan.";
        } else if (status === 422) {
          message =
            error.response?.data?.message ||
            "Data produk tidak valid.";
        } else if (status === 500) {
          message = "Terjadi kesalahan pada server. Silakan coba lagi.";
        } else {
          message =
            error.response?.data?.message ||
            "Gagal menambahkan produk ke keranjang.";
        }
      }

      setCartErrorMessage(message);
      setCartErrorModal(true);
    },
  });

  const handleAddToCart = () => {
    if (!product?.id) return
    addToCartMutation.mutate({
      product_id: product.id,
      quantity: qty,
    })
  }


  const handleSubmitReview = async () => {
    if (!product?.id) return;

    if (!reviewComment.trim()) {
      setReviewError("Komentar tidak boleh kosong");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Rating harus antara 1 sampai 5");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError("");

      if (editingReviewId) {
        // ==== MODE EDIT ====
        await updateReview(editingReviewId, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      } else {
        // ==== MODE CREATE ====
        await createReview(product.id, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      }

      setReviewRating(5);
      setReviewComment("");
      setEditingReviewId(null);
      setSuccessModal(true);

      await queryClient.invalidateQueries({
        queryKey: ["get-product-reviews", product.id],
      });
    } catch (error) {
      setFailedModal(true);
      let message = "Gagal mengirim ulasan. Silakan coba lagi.";
      console.error(error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          message = "Silakan login terlebih dahulu untuk memberikan ulasan.";
        } else if (status === 403) {
          message = "Kamu tidak memiliki izin untuk memberikan ulasan.";
        } else if (status === 422) {
          message =
            error.response?.data?.message ||
            "Data ulasan yang kamu masukkan tidak valid.";
        } else if (status === 500) {
          message = "Terjadi kesalahan pada server. Silakan coba lagi.";
        } else {
          message =
            error.response?.data?.message ||
            "Gagal mengirim ulasan. Silakan coba lagi.";
        }
      } else {
        message = "Terjadi kesalahan. Silakan coba lagi.";
      }

      setErrorMessage(message);
      setReviewError(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const subtotal = product ? product.price * qty : 0;

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? Math.min(
        subtotal * (appliedDiscount.value / 100),
        appliedDiscount.max_discount || Infinity
      )
      : appliedDiscount.value
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = () => {
    setDiscountError("");

    if (!discountCode.trim()) {
      setDiscountError("Masukkan kode discount");
      return;
    }

    const discount = product?.discounts?.find(
      (item) => item.code.toLowerCase() === discountCode.trim().toLowerCase()
    );

    if (!discount) {
      setAppliedDiscount(null);
      setDiscountError("Kode discount tidak tersedia");
      return;
    }

    if (!discount.is_active) {
      setAppliedDiscount(null);
      setDiscountError("Discount sudah tidak aktif");
      return;
    }

    if (
      discount.usage_limit > 0 &&
      discount.used_count >= discount.usage_limit
    ) {
      setAppliedDiscount(null);
      setDiscountError("Discount sudah mencapai batas penggunaan");
      return;
    }

    if (subtotal < discount.min_purchase) {
      setAppliedDiscount(null);
      setDiscountError(`Minimal pembelian ${format(discount.min_purchase)}`);
      return;
    }

    setAppliedDiscount(discount);
  };

  const format = (n?: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n ?? 0);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <a href="/">Beranda</a>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product?.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm">
              <img
                src={product?.thumbnail}
                alt={product?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Deskripsi
              </h2>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {product?.description}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-7">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                  {product?.title}
                </h1>

                <div className="flex items-center gap-3 mt-5">
                  <span className="text-2xl font-semibold text-gray-900">
                    {format(product?.price)}
                  </span>
                </div>
              </div>

              {product?.category === "shirt" ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Ukuran
                  </p>

                  <div className="grid grid-cols-6 gap-2">
                    {(product.size ?? []).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSize(s.size)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${selectedSize === s.size
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Jumlah
                </p>
                <div className="inline-flex items-center bg-white border border-gray-200 rounded-2xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 rounded-l-2xl"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 rounded-r-2xl"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Kode Discount
                  </p>

                  {appliedDiscount ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          {appliedDiscount.code}
                        </p>
                        <p className="text-xs text-green-600">
                          Discount berhasil diterapkan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedDiscount(null);
                          setDiscountCode("");
                          setDiscountError("");
                        }}
                        className="text-sm font-medium text-red-500 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => {
                            setDiscountCode(e.target.value);
                            setDiscountError("");
                          }}
                          placeholder="Masukkan kode"
                          className="flex-1 h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscount}
                          className="px-5 h-11 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
                        >
                          Terapkan
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-red-500 mt-2">
                          {discountError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <span className="font-medium">{format(subtotal)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-600 text-sm">Discount</span>
                    <span className="font-medium text-green-600">
                      - {format(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mb-5">
                  <span className="text-gray-500 text-sm">Pengiriman</span>
                  <span className="text-green-600 text-sm font-medium">
                    Gratis
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {format(total)}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <button onClick={() => router.push(`/buy/${product?.slug}`)} className="w-full h-14 bg-black text-white font-medium rounded-2xl hover:bg-gray-800 transition active:scale-[0.98]">
                    Beli Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="w-full h-14 bg-white border border-gray-200 text-gray-900 font-medium rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addToCartMutation.isPending
                      ? "Menambahkan..."
                      : "Tambah ke keranjang"}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Pembayaran aman • Garansi 30 hari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ULASAN & REVIEW ================= */}
        <section className="mt-24">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Ulasan Pembeli
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              {reviews.length} orang sudah memberikan penilaian
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* ========== LEFT ========== */}
            <div className="lg:col-span-4 space-y-5">
              {/* Rating Summary - lebih minimal */}
              <div className="bg-white rounded-[28px] border border-gray-100 p-6">
                <div className="flex items-center gap-5">
                  <div className="text-center min-w-[72px]">
                    <p className="text-4xl font-semibold tracking-tight text-gray-900">
                      {reviews.length > 0
                        ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
                        : "—"}
                    </p>
                    <div className="flex justify-center text-yellow-400 text-sm mt-1">
                      {"★".repeat(
                        Math.round(
                          reviews.length > 0
                            ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                            : 0
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                      return (
                        <div key={star} className="flex items-center gap-2.5">
                          <span className="text-xs text-gray-400 w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div
                id="review-form"
                className="bg-white rounded-[28px] border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {editingReviewId ? "Edit Ulasan" : "Tulis Ulasan"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {editingReviewId
                        ? "Perbarui penilaianmu"
                        : "Bagikan pengalamanmu"}
                    </p>
                  </div>

                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Stars - lebih soft */}
                <div className="flex gap-1.5 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 ${star <= reviewRating
                        ? "bg-yellow-400 text-white scale-105"
                        : "bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400"
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => {
                    setReviewComment(e.target.value);
                    setReviewError("");
                  }}
                  placeholder="Tulis pengalamanmu di sini..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3.5 text-sm outline-none focus:bg-white focus:border-gray-300 transition-all placeholder:text-gray-400"
                />

                {reviewError && (
                  <p className="text-sm text-red-500 mt-3">{reviewError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full mt-5 h-11 rounded-2xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmittingReview
                    ? "Menyimpan..."
                    : editingReviewId
                      ? "Simpan Perubahan"
                      : "Kirim Ulasan"}
                </button>
              </div>
            </div>

            {/* ========== RIGHT ========== */}
            <div className="lg:col-span-8">
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 rounded-[28px] bg-white border border-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : sortedReviews.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center bg-white rounded-[28px] border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl mb-4">
                    💬
                  </div>
                  <p className="font-medium text-gray-900">Belum ada ulasan</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Jadilah yang pertama memberikan penilaian
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedReviews.map((review) => {
                    const isMine = review.user?.id === currentUser?.id;

                    // Relative time
                    const getRelativeTime = (date: string) => {
                      const now = new Date();
                      const past = new Date(date);
                      const diff = Math.floor(
                        (now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      if (diff === 0) return "Hari ini";
                      if (diff === 1) return "Kemarin";
                      if (diff < 7) return `${diff} hari yang lalu`;
                      if (diff < 30) return `${Math.floor(diff / 7)} minggu yang lalu`;
                      return past.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    };

                    return (
                      <article
                        key={review.id}
                        className={`relative bg-white rounded-[28px] p-5 sm:p-6 transition-all duration-300 ${isMine
                          ? "border border-gray-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]"
                          : "border border-gray-100 hover:border-gray-200"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isMine
                              ? "bg-black text-white"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                              }`}
                          >
                            {(review.user?.name ?? "U").charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-gray-900 text-[15px]">
                                    {review.user?.name ?? "User"}
                                  </p>
                                  {isMine && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                      Kamu
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex text-yellow-400 text-xs tracking-tight">
                                    {"★".repeat(review.rating)}
                                    <span className="text-gray-200">
                                      {"★".repeat(5 - review.rating)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-300">·</span>
                                  <span className="text-xs text-gray-400">
                                    {getRelativeTime(review.created_at)}
                                    {review.updated_at &&
                                      review.updated_at !== review.created_at && (
                                        <span className="italic"> · diedit</span>
                                      )}
                                  </span>
                                </div>
                              </div>

                              {isMine && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(review)}
                                  className="shrink-0 text-xs font-medium text-gray-400 hover:text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition"
                                >
                                  Edit
                                </button>
                              )}
                            </div>

                            {/* Comment */}
                            <p className="mt-3 text-gray-600 text-[15px] leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= REKOMENDASI PRODUK ================= */}
        <section className="mt-20 pb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Kamu mungkin juga suka
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recommended.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <span className="text-yellow-500">★</span>
                    <span>{item.rating}</span>
                  </div>
                  <p className="mt-2 font-semibold text-gray-900">
                    {format(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SuccessModal
          isOpen={successModal}
          title={editingReviewId ? "Ulasan diperbarui!" : "Ulasan terkirim!"}
          subtitle="Terima kasih sudah berbagi pengalamanmu. Ulasan akan muncul setelah ditinjau."
          buttonText="Tutup"
          onClose={() => setSuccessModal(false)}
        />

        <ErrorModal
          isOpen={failedModal}
          title="Gagal mengirim ulasan"
          subtitle={errorMessage}
          buttonText="Tutup"
          onClose={() => setFailedModal(false)}
        />

        <SuccessModal
          isOpen={cartSuccessModal}
          title="Berhasil ditambahkan!"
          subtitle={`${product?.title} berhasil ditambahkan ke keranjang.`}
          buttonText="Lanjut Belanja"
          onClose={() => setCartSuccessModal(false)}
        />

        <ErrorModal
          isOpen={cartErrorModal}
          title="Gagal menambahkan"
          subtitle={cartErrorMessage}
          buttonText="Tutup"
          onClose={() => setCartErrorModal(false)}
        />
      </div>
    </div>
  );
}