"use client";

import SectionTitle from "@/components/SectionTitle";
import { DataTable } from "@/components/ui/table/data-table";
import { getOrders } from "@/services/order.service";
import { OrderProduct } from "@/types/order";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import {
    BadgeCheck,
    Box,
    Eye,
    MapPin,
    Package,
    Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderAdmin() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);

            setPagination((p) => ({
                ...p,
                pageIndex: 0,
            }));
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: [
            "orders",
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        ],

        queryFn: () =>
            getOrders(
                pagination.pageIndex + 1,
                pagination.pageSize,
                debouncedSearch
            ),

        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const ordersData: OrderProduct[] = data?.data ?? [];

    return (
        <div className="p-6 md:p-10 space-y-8">

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <SectionTitle
                    title="Manajemen Order"
                    sub="Daftar seluruh pesanan pelanggan"
                />
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    Gagal mengambil data order.
                </div>
            )}

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable
                    data={ordersData}
                    columns={[
                        {
                            type: "custom",
                            header: "Order",
                            render: (order) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">
                                            {order.order_number}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            #{order.id}
                                        </p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            type: "custom",
                            header: "Customer",
                            render: (order) => {
                                const user = order.user;

                                return (
                                    <div className="min-w-[160px]">
                                        <p className="text-sm font-medium truncate">
                                            {user?.name ?? "-"}
                                        </p>

                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email ?? "-"}
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Produk",
                            render: (order) => {
                                const items = order.order_item ?? [];

                                const totalQuantity = items.reduce(
                                    (total, item) =>
                                        total + Number(item.quantity),
                                    0
                                );

                                const firstItem = items[0];

                                return (
                                    <div className="min-w-[150px]">
                                        <p className="text-sm font-medium truncate max-w-[180px]">
                                            {firstItem?.product?.title ?? "-"}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {items.length > 1
                                                ? `+${items.length - 1} produk lainnya`
                                                : `${totalQuantity} item`}
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Total",
                            render: (order) => {
                                const total =
                                    Number(order.total_price) +
                                    Number(order.shipping_cost);

                                return (
                                    <div>
                                        <p className="font-semibold text-sm">
                                            Rp {total.toLocaleString("id-ID")}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            + Rp{" "}
                                            {Number(
                                                order.shipping_cost
                                            ).toLocaleString("id-ID")}{" "}
                                            ongkir
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "badge",
                            header: "Status Order",
                            key: "status_order",
                            variantMap: {
                                pending: "secondary",
                                paid: "default",
                                processing: "default",
                                shipped: "default",
                                completed: "default",
                                cancelled: "destructive",
                            },
                            labelMap: {
                                pending: "Pending",
                                paid: "Paid",
                                processing: "Processing",
                                shipped: "Shipped",
                                completed: "Completed",
                                cancelled: "Cancelled",
                            },
                        },
                        {
                            type: "custom",
                            header: "Pengiriman",
                            render: (order) => {
                                if (!order.status_shipment) {
                                    return (
                                        <span className="text-sm text-muted-foreground">
                                            -
                                        </span>
                                    );
                                }

                                return (
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground" />

                                        <div>
                                            <p className="text-sm capitalize">
                                                {order.status_shipment.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </p>

                                            {order.courier && (
                                                <p className="text-xs text-muted-foreground">
                                                    {order.courier}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Tracking",
                            render: (order) => (
                                <div className="min-w-[120px]">
                                    {order.tracking_number ? (
                                        <>
                                            <p className="text-sm font-medium">
                                                {order.tracking_number}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {order.courier ?? "-"}
                                            </p>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            Belum tersedia
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            type: "date",
                            header: "Tanggal",
                            key: "created_at",
                        },
                    ]}

                    actions={[
                        {
                            icon: Eye,
                            label: "Lihat Detail",
                            onClick: (order) => {
                                console.log("Detail order:", order);
                            },
                        },
                    ]}
                    searchValue={search}
                    onSearchChange={setSearch}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    pageCount={data?.totalPages ?? 1}
                />
            </div>

            {isFetching && !isLoading && (
                <span className="text-xs text-muted-foreground animate-pulse">
                    Memperbarui data...
                </span>
            )}
        </div>
    );
}