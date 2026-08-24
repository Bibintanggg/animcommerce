"use client";

import SectionTitle from "@/components/SectionTitle";
import { DataTable } from "@/components/ui/table/data-table";
import { getOrders, updateOrderStatus } from "@/services/order.service";
import { OrderProduct } from "@/types/order";
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import {
    Box,
    Eye,
    MapPin,
    Package,
    Truck,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Copy,
    Check,
    User,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StatusOrder } from "@/enums/order-status";
import axios from "axios";

const STATUS_ORDER_OPTIONS = [
    { value: "all", label: "Semua Status" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Diproses" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_FLOW = ["pending", "processing", "completed"] as const;

const UPDATEABLE_STATUSES = [
    {
        value: "pending",
        label: "Pending",
        description: "Menunggu proses",
        icon: Clock,
    },
    {
        value: "processing",
        label: "Diproses",
        description: "Sedang disiapkan",
        icon: RefreshCw,
    },
    {
        value: "completed",
        label: "Selesai",
        description: "Order selesai",
        icon: CheckCircle2,
    },
    {
        value: "cancelled",
        label: "Dibatalkan",
        description: "Batalkan order",
        icon: XCircle,
    },
] as const;

const statusOrderVariant: Record<string, string> = {
    pending:
        "bg-amber-500/10 text-amber-700 border-amber-200/80 dark:text-amber-400 dark:border-amber-500/30",
    processing:
        "bg-indigo-500/10 text-indigo-700 border-indigo-200/80 dark:text-indigo-400 dark:border-indigo-500/30",
    completed:
        "bg-emerald-500/10 text-emerald-700 border-emerald-200/80 dark:text-emerald-400 dark:border-emerald-500/30",
    cancelled:
        "bg-rose-500/10 text-rose-700 border-rose-200/80 dark:text-rose-400 dark:border-rose-500/30",
};

const statusOrderLabel: Record<string, string> = {
    pending: "Pending",
    processing: "Diproses",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

const paymentStatusVariant: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-200/80",
    success: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
    failed: "bg-rose-500/10 text-rose-700 border-rose-200/80",
    expired: "bg-gray-500/10 text-gray-700 border-gray-200/80",
};

const paymentStatusLabel: Record<string, string> = {
    pending: "Belum Dibayar",
    success: "Lunas",
    failed: "Gagal",
    expired: "Kedaluwarsa",
};

function canSelectStatus(
    current: StatusOrder,
    next: StatusOrder,
) {
    const transitions: Record<
        StatusOrder,
        StatusOrder[]
    > = {
        pending: ["processing", "cancelled"],
        processing: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
    };

    return transitions[current].includes(next);
}

function formatRupiah(value: number | string) {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getInitials(name?: string | null) {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function OrderAdmin() {
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<OrderProduct | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const [pendingStatus, setPendingStatus] = useState<StatusOrder | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, [statusFilter]);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: [
            "orders",
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
            statusFilter,
        ],
        queryFn: () =>
            getOrders(
                pagination.pageIndex + 1,
                pagination.pageSize,
                debouncedSearch,
            ),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const ordersData: OrderProduct[] = data?.data ?? [];

    const stats = useMemo(() => {
        const all = data?.data ?? [];
        return {
            total: data?.total ?? all.length,
            pending: all.filter((o) => o.status_order === "pending").length,
            processing: all.filter((o) => o.status_order === "processing").length,
            completed: all.filter((o) => o.status_order === "completed").length,
        };
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: number | string;
            status: StatusOrder;
        }) => updateOrderStatus(orderId, status),
        onSuccess: (_, variables) => {
            toast.success(
                `Status diubah ke ${statusOrderLabel[variables.status] ?? variables.status}`
            );

            setSelectedOrder((previous) => {
                if (
                    !previous ||
                    String(previous.id) !==
                    String(variables.orderId)
                ) {
                    return previous;
                }

                return {
                    ...previous,
                    status_order: variables.status,
                };
            });

            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setConfirmOpen(false);
            setPendingStatus(null);
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ??
                        "Gagal mengubah status order",
                );
                return;
            }

            toast.error("Gagal mengubah status order");
        },
    });

    const openDetail = (order: OrderProduct) => {
        setSelectedOrder(order);
        setSheetOpen(true);
        setCopied(false);
        setPendingStatus(null);
        setConfirmOpen(false);
    };

    const handleCopyTracking = async () => {
        if (!selectedOrder?.tracking_number) return;
        try {
            await navigator.clipboard.writeText(selectedOrder.tracking_number);
            setCopied(true);
            toast.success("Nomor tracking disalin");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    const requestStatusChange = (nextStatus: StatusOrder) => {
        if (!selectedOrder) return;
        if (nextStatus === selectedOrder.status_order) return;
        setPendingStatus(nextStatus);
        setConfirmOpen(true);
    };

    const confirmStatusChange = () => {
        if (!selectedOrder || !pendingStatus) return;
        updateMutation.mutate({
            orderId: selectedOrder.id,
            status: pendingStatus,
        });
    };

    const currentStatusIndex = selectedOrder
        ? STATUS_FLOW.indexOf(
            selectedOrder.status_order as (typeof STATUS_FLOW)[number]
        )
        : -1;

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <SectionTitle
                    title="Manajemen Order"
                    sub="Kelola seluruh pesanan pelanggan secara real-time"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Order",
                        value: stats.total,
                        icon: ShoppingBag,
                        iconBg: "bg-primary/10",
                        iconColor: "text-primary",
                    },
                    {
                        label: "Pending",
                        value: stats.pending,
                        icon: Clock,
                        iconBg: "bg-amber-500/10",
                        iconColor: "text-amber-600 dark:text-amber-400",
                    },
                    {
                        label: "Diproses",
                        value: stats.processing,
                        icon: RefreshCw,
                        iconBg: "bg-indigo-500/10",
                        iconColor: "text-indigo-600 dark:text-indigo-400",
                    },
                    {
                        label: "Selesai",
                        value: stats.completed,
                        icon: CheckCircle2,
                        iconBg: "bg-emerald-500/10",
                        iconColor: "text-emerald-600 dark:text-emerald-400",
                    },
                ].map((stat) => (
                    <Card
                        key={stat.label}
                        className="group border-none shadow-sm bg-gradient-to-br from-background to-muted/30 hover:shadow-md hover:ring-1 hover:ring-border/60 transition-all duration-200"
                    >
                        <CardContent className="p-5 flex items-center gap-4">
                            <div
                                className={cn(
                                    "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                                    stat.iconBg
                                )}
                            >
                                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0" />
                    Gagal mengambil data order. Silakan coba lagi.
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 border-b bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan daftar pesanan
                    </p>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_ORDER_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTable
                    data={ordersData}
                    columns={[
                        {
                            type: "custom",
                            header: "Order",
                            render: (order) => (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm leading-none">
                                            {order.order_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
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
                                            {user?.name ?? "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email ?? "—"}
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Produk",
                            render: (order) => {
                                const items = order.items ?? [];
                                const totalQuantity = items.reduce(
                                    (total, item) => total + Number(item.quantity),
                                    0
                                );
                                const firstItem = items[0];
                                return (
                                    <div className="min-w-[160px]">
                                        <p className="text-sm font-medium truncate max-w-[200px]">
                                            {firstItem?.product?.title ?? "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
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
                                    Number(order.total_price) + Number(order.shipping_cost);
                                return (
                                    <div>
                                        <p className="font-semibold text-sm tabular-nums">
                                            {formatRupiah(total)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            + {formatRupiah(order.shipping_cost)} ongkir
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Status",
                            render: (order) => (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "font-medium border capitalize px-2.5 py-0.5",
                                        statusOrderVariant[order.status_order] ??
                                        "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {statusOrderLabel[order.status_order] ?? order.status_order}
                                </Badge>
                            ),
                        },
                        {
                            type: "custom",
                            header: "Pengiriman",
                            render: (order) => {
                                if (!order.status_shipment) {
                                    return (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    );
                                }
                                return (
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-sm capitalize">
                                                {order.status_shipment.replace(/_/g, " ")}
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
                                            <p className="text-sm font-medium font-mono tracking-tight">
                                                {order.tracking_number}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.courier ?? "—"}
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
                            type: "custom",
                            header: "Pembayaran",
                            render: (order) => {
                                const payment = order.payment;
                                if (!payment) {
                                    return (
                                        <span className="text-sm text-muted-foreground">
                                            Belum tersedia
                                        </span>
                                    );
                                }
                                return (
                                    <div className="space-y-1">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-medium border",
                                                paymentStatusVariant[payment.payment_status]
                                            )}
                                        >
                                            {paymentStatusLabel[payment.payment_status] ??
                                                payment.payment_status}
                                        </Badge>
                                        <p className="text-xs uppercase text-muted-foreground">
                                            {payment.payment_method}
                                        </p>
                                    </div>
                                );
                            },
                        },
                        {
                            type: "custom",
                            header: "Alamat",
                            render: (order) => (
                                <div className="min-w-[140px] max-w-[180px]">
                                    {order.user_address?.address_line ? (
                                        <>
                                            <p className="text-sm font-medium truncate">
                                                {order.user_address.address_line}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {order.user_address.city ?? "—"}
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
                            onClick: (order) => openDetail(order),
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
                <p className="text-xs text-muted-foreground animate-pulse text-center">
                    Memperbarui data...
                </p>
            )}

            {/* ========== DETAIL SHEET ========== */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden">
                    {selectedOrder && (
                        <>
                            <div className="px-6 pt-6 pb-5 border-b bg-muted/30">
                                <SheetHeader className="space-y-3 text-left">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1 min-w-0">
                                            <SheetTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                                    <Package className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="truncate">
                                                    {selectedOrder.order_number}
                                                </span>
                                            </SheetTitle>
                                            <SheetDescription className="text-xs">
                                                #{selectedOrder.id} ·{" "}
                                                {formatDate(selectedOrder.created_at)}
                                            </SheetDescription>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "shrink-0 font-medium border px-2.5 py-1",
                                                statusOrderVariant[selectedOrder.status_order]
                                            )}
                                        >
                                            {statusOrderLabel[selectedOrder.status_order]}
                                        </Badge>
                                    </div>

                                    {selectedOrder.status_order !== "cancelled" && (
                                        <div className="flex items-center gap-1 pt-1">
                                            {STATUS_FLOW.map((step, idx) => {
                                                const isActive = idx <= currentStatusIndex;
                                                return (
                                                    <div
                                                        key={step}
                                                        className="flex items-center flex-1 last:flex-none"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "h-1.5 w-full rounded-full transition-colors",
                                                                isActive ? "bg-primary" : "bg-muted"
                                                            )}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                {/* ===== UPDATE STATUS (UX utama) ===== */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Ubah Status Order
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {UPDATEABLE_STATUSES.map((s) => {
                                            const isCurrent =
                                                selectedOrder.status_order === s.value;
                                            const isAllowed = canSelectStatus(
                                                selectedOrder.status_order,
                                                s.value,
                                            );
                                            const isDestructive = s.value === "cancelled";
                                            const Icon = s.icon;

                                            return (
                                                <button
                                                    key={s.value}
                                                    type="button"
                                                    disabled={isCurrent || !isAllowed || updateMutation.isPending}
                                                    onClick={() => requestStatusChange(s.value)}
                                                    className={cn(
                                                        "relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                                                        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "disabled:opacity-60 disabled:cursor-not-allowed",
                                                        isCurrent &&
                                                        "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                                                        isDestructive &&
                                                        !isCurrent &&
                                                        "hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                                                    )}
                                                >
                                                    <div className="flex w-full items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Icon
                                                                className={cn(
                                                                    "h-4 w-4",
                                                                    isCurrent
                                                                        ? "text-primary"
                                                                        : isDestructive
                                                                            ? "text-rose-500"
                                                                            : "text-muted-foreground"
                                                                )}
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {s.label}
                                                            </span>
                                                        </div>
                                                        {isCurrent && (
                                                            <Check className="h-3.5 w-3.5 text-primary" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground pl-6">
                                                        {s.description}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <Separator />

                                {/* Customer */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        Customer
                                    </h4>
                                    <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                                            {getInitials(selectedOrder.user?.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {selectedOrder.user?.name ?? "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {selectedOrder.user?.email ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Products */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Box className="h-3.5 w-3.5" />
                                        Produk · {selectedOrder.items?.length ?? 0} item
                                    </h4>
                                    <div className="space-y-2">
                                        {(selectedOrder.items ?? []).map((item, idx) => {
                                            const lineTotal =
                                                Number(item.price ?? item.product?.price ?? 0) *
                                                Number(item.quantity);
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3.5"
                                                >
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p className="text-sm font-medium leading-snug line-clamp-2">
                                                            {item.product?.title ?? "Produk"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatRupiah(
                                                                item.price ?? item.product?.price ?? 0
                                                            )}{" "}
                                                            × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold tabular-nums shrink-0">
                                                        {formatRupiah(lineTotal)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Address */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Alamat Pengiriman
                                    </h4>
                                    <div className="rounded-xl border bg-card p-3.5 text-sm space-y-1">
                                        {selectedOrder.user_address ? (
                                            <>
                                                <p className="font-medium leading-snug">
                                                    {selectedOrder.user_address.address_line}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {[
                                                        selectedOrder.user_address.city,
                                                        selectedOrder.user_address.postal_code,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">
                                                Belum tersedia
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Shipping */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Truck className="h-3.5 w-3.5" />
                                        Pengiriman
                                    </h4>
                                    <div className="rounded-xl border bg-card p-3.5 space-y-3 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Kurir</span>
                                            <span className="font-medium text-right">
                                                {selectedOrder.courier ?? "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="capitalize text-right">
                                                {selectedOrder.status_shipment?.replace(/_/g, " ") ??
                                                    "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 pt-1 border-t">
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Tracking Number
                                                </p>
                                                <p className="font-mono text-sm font-medium truncate">
                                                    {selectedOrder.tracking_number ?? "Belum tersedia"}
                                                </p>
                                            </div>
                                            {selectedOrder.tracking_number && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0"
                                                    onClick={handleCopyTracking}
                                                >
                                                    {copied ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Payment */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Ringkasan Pembayaran
                                    </h4>
                                    <div className="rounded-xl border bg-card p-4 space-y-2.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="tabular-nums">
                                                {formatRupiah(selectedOrder.total_price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ongkir</span>
                                            <span className="tabular-nums">
                                                {formatRupiah(selectedOrder.shipping_cost)}
                                            </span>
                                        </div>
                                        <Separator className="my-1" />
                                        <div className="flex justify-between items-center pt-0.5">
                                            <span className="font-semibold">Total</span>
                                            <span className="text-base font-semibold tabular-nums">
                                                {formatRupiah(
                                                    Number(selectedOrder.total_price) +
                                                    Number(selectedOrder.shipping_cost)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="border-t bg-background px-6 py-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSheetOpen(false)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* ===== CONFIRM DIALOG ===== */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Ubah status order?</DialogTitle>
                        <DialogDescription>
                            {pendingStatus === "cancelled" ? (
                                <>
                                    Order{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedOrder?.order_number}
                                    </span>{" "}
                                    akan{" "}
                                    <span className="font-medium text-rose-600">dibatalkan</span>.
                                    Tindakan ini sebaiknya hanya dilakukan jika memang diperlukan.
                                </>
                            ) : (
                                <>
                                    Ubah status{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedOrder?.order_number}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-foreground">
                                        {statusOrderLabel[selectedOrder?.status_order ?? ""] ??
                                            selectedOrder?.status_order}
                                    </span>{" "}
                                    ke{" "}
                                    <span className="font-medium text-foreground">
                                        {statusOrderLabel[pendingStatus ?? ""] ?? pendingStatus}
                                    </span>
                                    ?
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmOpen(false);
                                setPendingStatus(null);
                            }}
                            disabled={updateMutation.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={pendingStatus === "cancelled" ? "destructive" : "default"}
                            onClick={confirmStatusChange}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : pendingStatus === "cancelled" ? (
                                "Ya, batalkan"
                            ) : (
                                "Ya, ubah status"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}