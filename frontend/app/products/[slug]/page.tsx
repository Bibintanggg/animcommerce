"use client";

import { getProductDetails } from "@/services/product.service";
import { Discount } from "@/types/product-discount";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailProduct() {
    const params = useParams()

    const slug = params.slug as string;
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['get-products', slug],
        queryFn: () => getProductDetails(slug),
        enabled: !!slug
    })

    // console.log(product)

    const reviews = [
        {
            id: 1,
            name: "Andi Pratama",
            rating: 5,
            date: "12 Juli 2026",
            comment:
                "Sangat nyaman dipakai lari pagi. Ringan banget dan tidak bikin kaki panas. Recommended!",
        },
        {
            id: 2,
            name: "Siti Rahma",
            rating: 5,
            date: "5 Juli 2026",
            comment:
                "Bahannya bagus, packing rapi. Warnanya sesuai foto. Sudah order yang kedua kalinya.",
        },
        {
            id: 3,
            name: "Budi Santoso",
            rating: 4,
            date: "28 Juni 2026",
            comment:
                "Kualitas oke, hanya saja agak kecil jadi saya size up. Overall puas.",
        },
    ];

    const recommended = [
        {
            id: 1,
            name: "Urban Sneaker X",
            price: 1599000,
            image: "https://images.unsplash.com/photo-1525966222134-fcfa4f85c945?w=400&q=80",
            rating: 4.7,
        },
        {
            id: 2,
            name: "Trail Flex 2.0",
            price: 2199000,
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
            rating: 4.9,
        },
        {
            id: 3,
            name: "Classic Court Low",
            price: 1299000,
            image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
            rating: 4.6,
        },
        {
            id: 4,
            name: "Motion Knit Elite",
            price: 1899000,
            image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
            rating: 4.8,
        },
    ];

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("42");
    const [qty, setQty] = useState(1);

    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [discountError, setDiscountError] = useState("");


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
            (item) =>
                item.code.toLowerCase() === discountCode.trim().toLowerCase()
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

        if (discount.usage_limit > 0 && discount.used_count >= discount.usage_limit) {
            setAppliedDiscount(null);
            setDiscountError("Discount sudah mencapai batas penggunaan");
            return;
        }

        if (subtotal < discount.min_purchase) {
            setAppliedDiscount(null);
            setDiscountError(
                `Minimal pembelian ${format(discount.min_purchase)}`
            );
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

                        {/* <div className="flex gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 rounded-2xl overflow-hidden transition-all duration-200 ${selectedImage === i
                                        ? "ring-2 ring-black ring-offset-2"
                                        : "opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div> */}

                        <div className="pt-2">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h2>
                            <p className="text-gray-600 leading-relaxed text-[15px]">
                                {product?.description}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-8 space-y-7">
                            <div>
                                {/* <p className="text-sm font-medium text-gray-500 mb-1">{product.brand}</p> */}
                                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                                    {product?.title}
                                </h1>

                                <div className="flex items-center gap-3 mt-5">
                                    <span className="text-2xl font-semibold text-gray-900">
                                        {format(product?.price)}
                                    </span>
                                    {/* <span className="text-base text-gray-400 line-through">
                                        {format(product.originalPrice)}
                                    </span> */}
                                </div>

                                {/* <div className="flex items-center gap-2 mt-3 text-sm">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-medium text-gray-900">{product.rating}</span>
                                    <span className="text-gray-400">
                                        ({product.reviewsCount.toLocaleString()} ulasan)
                                    </span>
                                </div> */}
                            </div>

                            {/* Color */}
                            {/* <div>
                                <p className="text-sm font-medium text-gray-900 mb-3">
                                    Warna — <span className="text-gray-500 font-normal">{selectedColor.name}</span>
                                </p>
                                <div className="flex gap-3">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => setSelectedColor(c)}
                                            className={`w-10 h-10 rounded-full border transition-all duration-200 ${selectedColor.name === c.name
                                                ? "ring-2 ring-black ring-offset-2 scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    ))}
                                </div>
                            </div> */}

                            {/* Size */}
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

                            {/* Qty */}
                            <div>
                                <p className="text-sm font-medium text-gray-900 mb-3">Jumlah</p>
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

                                {/* Discount */}
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

                                {/* Subtotal */}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-sm">
                                        Subtotal
                                    </span>

                                    <span className="font-medium">
                                        {format(subtotal)}
                                    </span>
                                </div>

                                {/* Discount amount */}
                                {appliedDiscount && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-green-600 text-sm">
                                            Discount
                                        </span>

                                        <span className="font-medium text-green-600">
                                            - {format(discountAmount)}
                                        </span>
                                    </div>
                                )}

                                {/* Shipping */}
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-gray-500 text-sm">
                                        Pengiriman
                                    </span>

                                    <span className="text-green-600 text-sm font-medium">
                                        Gratis
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                    <span className="font-semibold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-2xl font-semibold tracking-tight">
                                        {format(total)}
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button className="w-full h-14 bg-black text-white font-medium rounded-2xl hover:bg-gray-800 transition active:scale-[0.98]">
                                        Beli Sekarang
                                    </button>

                                    <button className="w-full h-14 bg-white border border-gray-200 text-gray-900 font-medium rounded-2xl hover:bg-gray-50 transition">
                                        Tambah ke Keranjang
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
                <section className="mt-20">
                    {/* <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Ulasan Pembeli</h2>
                            <p className="text-gray-500 mt-1">
                                Berdasarkan {product.reviewsCount.toLocaleString()} ulasan
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-semibold">{product.rating}</span>
                            <div className="text-yellow-500 text-lg">★★★★★</div>
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map((r) => (
                            <div
                                key={r.id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-medium text-gray-900">{r.name}</p>
                                    <span className="text-sm text-gray-400">{r.date}</span>
                                </div>
                                <div className="text-yellow-500 text-sm mb-3">
                                    {"★".repeat(r.rating)}
                                    {"☆".repeat(5 - r.rating)}
                                </div>
                                <p className="text-gray-600 text-[15px] leading-relaxed">
                                    {r.comment}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button className="px-6 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white transition">
                            Lihat Semua Ulasan
                        </button>
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
            </div>
        </div>
    );
}