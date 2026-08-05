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

interface ProductFormProps {
    url: string
    mode?: "create" | "edit";
    product?: Product | null;
    method?: "PUT" | "POST";
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function ProductForm({ url, mode = "create", product, method }: ProductFormProps) {
    const [formData, setFormData] = useState<{
        title: string,
        thumbnail: string,
        slug: string,
        description: string,
        price: number,
        stock: number,
        is_active: ProductStatus,
        category: ProductCategory
    }>({
        title: "",
        thumbnail: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        is_active: ProductStatus.ProductDraft,
        category: ProductCategory.FigureCategry
    })

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient()

    useEffect(() => {
        if (mode == "edit" && product) {
            setFormData({
                title: product.title,
                thumbnail: product.thumbnail,
                slug: product.slug,
                description: product.description,
                price: product.price,
                stock: product.stock,
                is_active: product.is_active,
                category: product.category
            });
            setThumbnailPreview(product.thumbnail || null);
            setThumbnailFile(null);
        }

        if (mode == "create") {
            setFormData({
                title: "",
                thumbnail: "",
                slug: "",
                description: "",
                price: 0,
                stock: 0,
                is_active: ProductStatus.ProductDraft,
                category: ProductCategory.FigureCategry
            });
            setThumbnailPreview(null);
            setThumbnailFile(null);
        }
    }, [product, mode])

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: mode === "create" ? generateSlug(value) : prev.slug
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

    const uploadThumbnail = async (file: File): Promise<string> => {
        const token = localStorage.getItem("token");
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: uploadForm,
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || "Gagal mengunggah gambar");
        }

        return result.url as string;
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

        if (mode === "create" && !thumbnailFile) {
            setError("Thumbnail wajib diunggah");
            setIsLoading(false);
            return;
        }

        try {
            // const payload = new FormData();
            // payload.append("title", formData.title);
            // payload.append("slug", formData.slug);
            // payload.append("description", formData.description);
            // payload.append("price", String(formData.price));
            // payload.append("stock", String(formData.stock));
            // payload.append("is_active", String(formData.is_active));
            // payload.append("category", formData.category)

            const body = new FormData();


            body.append("title", formData.title);
            body.append("slug", formData.slug);
            body.append("description", formData.description);
            body.append("price", String(formData.price));
            body.append("stock", String(formData.stock));
            body.append("category", formData.category);
            body.append("is_active", String(formData.is_active));

            if (thumbnailFile) {
                body.append("thumbnail", thumbnailFile);
            }

            if (mode === "edit") {
                await updateProduct(url, body);
            } else {
                await createProduct(url, body);
            }

            await queryClient.invalidateQueries({
                queryKey: ['products'],
            })

            gooeyToast.success(
                mode == "edit" ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan"
            )

            setFormData({
                title: "",
                thumbnail: "",
                slug: "",
                description: "",
                price: 0,
                stock: 0,
                is_active: ProductStatus.ProductDraft,
                category: ProductCategory.FigureCategry
            });
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
                    onChange={(e) => setFormData({
                        ...formData,
                        description: e.target.value
                    })}
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
                        onChange={(e) => setFormData({
                            ...formData,
                            price: Number(e.target.value)
                        })}
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
                        onChange={(e) => setFormData({
                            ...formData,
                            stock: Number(e.target.value)
                        })}
                        required
                    />
                </div>
            </div>

            <hr className="border-t-2 border-black/40 w-full" />

            <div className="space-y-2">
                <Label className="mb-5">Kategori & Status</Label>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    category: value as ProductCategory,
                                })
                            }
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

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={formData.is_active}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    is_active: value as ProductStatus,
                                })
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

                {isUploading && (
                    <p className="text-xs text-gray-500">Mengunggah gambar...</p>
                )}
            </div>

            <Button className="w-full" type="submit" disabled={isLoading || isUploading}>
                {isUploading ? "Mengunggah..." : isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
        </form>
    );
}