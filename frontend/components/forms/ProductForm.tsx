"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";
import { ProductCategory } from "@/enums/product-category";
import { useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { ImagePlus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createProduct, updateProduct } from "@/services/product.service";
import { ProductStatus } from "@/enums/product-status";
import { ProductSize } from "@/types/product-type";
import { Discount, DiscountFormData } from "@/types/product-discount";
import { Review } from "@/types/product-review";

interface ProductFormProps {
    url: string;
    mode?: "create" | "edit";
    product?: Product | null;
    onSuccess?: (product: Product) => void;
}

interface ProductFormData {
    title: string;
    thumbnail: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    is_active: ProductStatus;
    category: ProductCategory;
    is_featured: boolean;
    size: string[];
    discount: DiscountFormData;
}

function createEmptyDiscount(): DiscountFormData {
    return {
        code: "",
        type: "percentage",
        value: 0,
        min_purchase: 0,
        max_discount: 0,
        usage_limit: 0,
        start_at: null,
        end_at: null,
        is_active: true,
    };
}

function createEmptyFormData(): ProductFormData {
    return {
        title: "",
        thumbnail: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        is_active: ProductStatus.ProductDraft,
        category: ProductCategory.FigureCategry,
        is_featured: false,
        size: [],
        discount: createEmptyDiscount(),
    };
}

function createEditFormData(product: Product): ProductFormData {
    const discount = product.discounts?.[0];

    return {
        title: product.title ?? "",
        thumbnail: product.thumbnail ?? "",
        slug: product.slug ?? "",
        description: product.description ?? "",
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        is_active: product.is_active ?? ProductStatus.ProductDraft,
        category: product.category ?? ProductCategory.FigureCategry,
        is_featured: Boolean(product.is_featured),
        size: product.size?.map((item) => item.size) ?? [],

        // Ambil discount lama saat edit
        discount: discount
            ? {
                code: discount.code ?? "",
                type: discount.type ?? "percentage",
                value: Number(discount.value) || 0,
                min_purchase: Number(discount.min_purchase) || 0,
                max_discount: Number(discount.max_discount) || 0,
                usage_limit: Number(discount.usage_limit) || 0,
                start_at: discount.start_at ?? null,
                end_at: discount.end_at ?? null,
                is_active: discount.is_active ?? true,
            }
            : createEmptyDiscount(),
    };
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function ProductForm({ url, mode = "create", product, onSuccess }: ProductFormProps) {

    const [formData, setFormData] = useState<ProductFormData>(() =>
        mode === "edit" && product
            ? createEditFormData(product)
            : createEmptyFormData()
    );

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        mode === "edit" ? product?.thumbnail || null : null
    );

    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();



    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: mode === "create" ? generateSlug(value) : prev.slug
        }));
    };

    const handleCategoryChange = (value: ProductCategory) => {
        setFormData((prev) => ({
            ...prev,
            category: value,
            // Reset size setiap kali kategori diganti ke selain Shirt
            // (mis. Figure atau Accessory), supaya tidak ada size "nyangkut"
            // dari kategori sebelumnya.
            size: value === ProductCategory.ShirtCategory ? prev.size : [],
        }));
    };

    const applyThumbnailFile = (file: File | undefined | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("File harus berupa gambar");
            return;
        }
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        applyThumbnailFile(e.target.files?.[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        applyThumbnailFile(e.dataTransfer.files?.[0]);
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setFormData((prev) => ({ ...prev, thumbnail: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (formData.title.length > 150) {
            setError("Judul produk maksimal 150 karakter");
            setIsLoading(false);
            return;
        }

        if (formData.slug.length > 150) {
            setError("Slug maksimal 150 karakter");
            setIsLoading(false);
            return;
        }

        if (formData.price < 0) {
            setError("Harga tidak boleh negatif");
            setIsLoading(false);
            return;
        }

        if (formData.stock < 0) {
            setError("Stok tidak boleh negatif");
            setIsLoading(false);
            return;
        }

        if (mode === "create") {
            setFormData(createEmptyFormData());
            setThumbnailFile(null);
            setThumbnailPreview(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }

        try {
            const body = new FormData();

            body.append("title", formData.title);
            body.append("slug", formData.slug);
            body.append("description", formData.description);
            body.append("price", String(formData.price));
            body.append("stock", String(formData.stock));
            body.append("category", formData.category);
            body.append("is_active", String(formData.is_active));
            body.append("is_featured", String(formData.is_featured));
            body.append("sizes", JSON.stringify(formData.size));

            if (
                formData.discount.code.trim() !== "" &&
                formData.discount.value > 0
            ) {
                body.append(
                    "discount",
                    JSON.stringify(formData.discount)
                );
            }
            if (thumbnailFile) {
                body.append("thumbnail", thumbnailFile);
            }
            const savedProduct =
                mode === "edit"
                    ? await updateProduct(url, body)
                    : await createProduct(url, body);

            await queryClient.invalidateQueries({
                queryKey: ["products"],
            });

            gooeyToast.success(
                mode === "edit"
                    ? "Produk berhasil diperbarui"
                    : "Produk berhasil ditambahkan"
            );

            setThumbnailFile(null);
            setThumbnailPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            gooeyToast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Judul Produk</Label>
                <Input
                    id="title"
                    placeholder="Judul Produk (max 150 karakter)"
                    maxLength={150}
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                    id="description"
                    placeholder="Deskripsi produk"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        description: e.target.value
                    }))}
                    className="min-h-24 resize-y"
                    required
                />
            </div>

            {/* price & stock flex side by side */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="price">Harga</Label>
                    <Input
                        id="price"
                        type="number"
                        placeholder="Harga"
                        min={0}
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value)
                        }))}
                        required
                    />
                </div>

                <div className="flex-1 space-y-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                        id="stock"
                        type="number"
                        placeholder="Stok"
                        min={0}
                        value={formData.stock}
                        onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            stock: Number(e.target.value)
                        }))}
                        required
                    />
                </div>
            </div>

            <hr className="border-t-2 border-black/30 w-full" />

            <div className="space-y-2">
                <Label className="mb-5">Kategori & Status</Label>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleCategoryChange(value as ProductCategory)}
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ProductCategory.FigureCategry}>Figure</SelectItem>
                                <SelectItem value={ProductCategory.AccessoryCategory}>Accessory</SelectItem>
                                <SelectItem value={ProductCategory.ShirtCategory}>Shirt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.category === ProductCategory.ShirtCategory && (
                        <div className="space-y-2">
                            <Label>Size</Label>

                            <div className="flex flex-wrap gap-2">
                                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                size: prev.size.includes(size)
                                                    ? prev.size.filter((item) => item !== size)
                                                    : [...prev.size, size],
                                            }));
                                        }}
                                        className={`rounded-md border px-4 py-2 transition-colors ${formData.size.includes(size)
                                            ? "border-primary bg-primary text-white"
                                            : "border-border bg-background hover:bg-muted"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={formData.is_active}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    is_active: value as ProductStatus,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ProductStatus.ProductDraft}>Draft</SelectItem>
                                <SelectItem value={ProductStatus.ProductPublished}>Published</SelectItem>
                                <SelectItem value={ProductStatus.ProductArchived}>Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Produk Unggulan</Label>

                        <Select
                            value={formData.is_featured ? "true" : "false"}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    is_featured: value === "true",
                                }))
                            }
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="true">
                                    Ya
                                </SelectItem>

                                <SelectItem value="false">
                                    Tidak
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <hr className="border-t-2 border-black/30 w-40 flex justify-center mx-auto" />

            <div className="space-y-2">
                <Label className="mb-5">Diskon Produk (Opsional)</Label>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kode Diskon</Label>
                        <Input
                            value={formData.discount?.code}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        code: e.target.value,
                                    },
                                }))
                            }
                            placeholder="Contoh: NIHON10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Diskon</Label>

                        <Select
                            value={formData.discount.type}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        type: value,
                                    },
                                }))
                            }
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Pilih tipe diskon" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="percentage">
                                    Persentase
                                </SelectItem>

                                <SelectItem value="fixed">
                                    Nominal
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Nilai Diskon */}
                    <div className="space-y-2">
                        <Label>Nilai Diskon</Label>

                        <Input
                            type="number"
                            value={formData.discount.value}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        value: Number(e.target.value),
                                    },
                                }))
                            }
                            placeholder="Contoh: 10"
                        />
                    </div>

                    {/* Minimal Pembelian */}
                    <div className="space-y-2">
                        <Label>Minimal Pembelian</Label>

                        <Input
                            type="number"
                            value={formData.discount.min_purchase}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        min_purchase: Number(e.target.value),
                                    },
                                }))
                            }
                            placeholder="Contoh: 100000"
                        />
                    </div>

                    {/* Maksimal Diskon */}
                    <div className="space-y-2">
                        <Label>Maksimal Diskon</Label>

                        <Input
                            type="number"
                            value={formData.discount.max_discount}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        max_discount: Number(e.target.value),
                                    },
                                }))
                            }
                            placeholder="Contoh: 50000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Batas Penggunaan</Label>

                        <Input
                            type="number"
                            value={formData.discount.usage_limit}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    discount: {
                                        ...prev.discount,
                                        usage_limit: Number(e.target.value),
                                    },
                                }))
                            }
                            placeholder="Contoh: 100"
                        />
                    </div>
                </div>
            </div>


            {/* thumbnail uploader - paling bawah, besar, dengan animasi */}
            <div className="space-y-2">
                <Label>Thumbnail</Label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={[
                        "group relative w-full h-40 rounded-xl border-2 border-dashed cursor-pointer",
                        "flex items-center justify-center overflow-hidden",
                        "transition-all duration-300 ease-out",
                        isDragging
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40"
                    ].join(" ")}
                >
                    {thumbnailPreview ? (
                        <>
                            <img
                                src={thumbnailPreview}
                                alt="Preview thumbnail"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                                    Klik atau drag untuk ganti gambar
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveThumbnail(); }}
                                className="absolute top-3 right-3 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80 transition-colors duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1">
                            <div className="rounded-full bg-muted p-4 transition-transform duration-300 group-hover:scale-110">
                                <ImagePlus className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-medium">Klik atau drag gambar ke sini</p>
                            <p className="text-xs">PNG, JPG hingga beberapa MB</p>
                        </div>
                    )}
                </div>

            </div>

            <Button
                className="w-full"
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
        </form >
    );
}