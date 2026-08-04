"use client"

import CreateModal from "@/components/CreateModal";
import EditModal from "@/components/EditModal";
import { ProductForm } from "@/components/forms/ProductForm";
import { UserForm } from "@/components/forms/UserForm";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Products() {
    const { data, isLoading, isFetching, error, } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts
    })
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<Product | null>(null)

    const handleEdit = (product: Product) => {
        setOpenEditModal(true)
        setSelectedProduct(product)
    }

    const handleDelete = (product: Product) => {
        setDeleteTarget(true)
        setOpenDeleteModal(product)
    }
    const productsData: Product[] = data || []
    console.log(productsData)
    return (
        <div className="p-10">
            <div className="flex items-start justify-between gap-4 mb-6">
                <SectionTitle
                    title="Manajemen Pengguna"
                    sub="Daftar lengkap seluruh pengguna, bisa difilter dan dicari"
                />

                <CreateModal
                    title="Tambah Produk Baru"
                    description="Tambah dan buat produk baru untuk di display"
                    url="http://localhost:8080/api/admin/products"
                    trigger={<Button>Tambah Produk</Button>}
                >
                    <ProductForm url="http://localhost:8080/api/admin/products" />
                </CreateModal>
            </div>

            <div className="flex items-start justify-between gap-4 mb-6">
                <EditModal
                    open={openEditModal}
                    onOpenChange={setOpenEditModal}
                    title="Edit Produk"
                    description="Perbarui informasi produk"
                >
                    <ProductForm
                        mode="edit"
                        product={selectedProduct}
                        url={`http://localhost:8080/api/admin/products/${selectedProduct?.id}`}
                        method="PUT"
                    />
                </EditModal>
            </div>

            <DataTable
                data={productsData}
                columns={[
                    {
                        type: "avatar",
                        header: "Produk",
                        titleKey: "title",
                        subtitleKey: "slug",
                        imageKey: "thumbnail",
                    },
                    {
                        type: "custom",
                        header: "Kategori",
                        render: (product) => (
                            <span>{product.category}</span>
                        ),
                    },
                    {
                        type: "custom",
                        header: "Harga",
                        render: (product) => (
                            <span>
                                Rp {product.price.toLocaleString("id-ID")}
                            </span>
                        ),
                    },
                    {
                        type: "custom",
                        header: "Stok",
                        render: (product) => (
                            <span>{product.stock}</span>
                        ),
                    },
                    {
                        type: "badge",
                        header: "Status",
                        key: "is_active",
                        variantMap: {
                            draft: "secondary",
                            published: "default",
                            archived: "destructive",
                        },
                        labelMap: {
                            draft: "Draft",
                            published: "Published",
                            archived: "Archived",
                        },
                    },
                    {
                        type: "date",
                        header: "Dibuat",
                        key: "createdAt",
                    },
                ]}
                actions={[
                    {
                        icon: Pencil,
                        label: "Edit",
                        onClick: handleEdit,
                    },
                    {
                        icon: Trash2,
                        label: "Hapus",
                        onClick: handleDelete,
                        className: "text-destructive",
                    },
                ]}
            />
        </div>
    )
}