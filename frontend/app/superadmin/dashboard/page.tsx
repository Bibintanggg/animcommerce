"use client";

import { useEffect, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import {
    Pencil,
    Trash2,
    KeyRound,
    ShieldCheck,
    ShieldOff,
    Users,
    UserCheck,
    UserX,
    UserMinus,
    ShoppingCart,
    TrendingUp,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    LogIn,
    Package,
    CreditCard,
    BarChart2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserStatus = "active" | "inactive" | "banned";
type UserRole = "admin" | "editor" | "viewer";
type ActivityType = "checkout" | "register" | "login" | "order_shipped" | "payment_failed";

interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    email_verified_at: string | null;
    last_login_at: string | null;
    created_at: string;
    city: string;
    lat: number;
    lng: number;
}

interface ActivityLog {
    id: number;
    user: string;
    type: ActivityType;
    detail: string;
    time: string;
    amount?: string;
}

interface UserOrigin {
    city: string;
    count: number;
    color: string;
}

// ─── Configs ─────────────────────────────────────────────────────────────────

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
    active: { label: "Aktif", className: "bg-[#EAF3DE] text-[#3B6D11]" },
    inactive: { label: "Nonaktif", className: "bg-[#F1EFE8] text-[#5F5E5A]" },
    banned: { label: "Banned", className: "bg-[#FCEBEB] text-[#A32D2D]" },
};

const roleConfig: Record<UserRole, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-[#EEEDFE] text-[#3C3489]" },
    editor: { label: "Editor", className: "bg-[#E6F1FB] text-[#185FA5]" },
    viewer: { label: "Viewer", className: "bg-[#FAEEDA] text-[#854F0B]" },
};

const activityConfig: Record<ActivityType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    checkout: {
        label: "Checkout",
        icon: <ShoppingCart className="h-3.5 w-3.5" />,
        color: "text-[#185FA5]",
        bg: "bg-[#E6F1FB]",
    },
    register: {
        label: "Registrasi",
        icon: <UserCheck className="h-3.5 w-3.5" />,
        color: "text-[#3B6D11]",
        bg: "bg-[#EAF3DE]",
    },
    login: {
        label: "Login",
        icon: <LogIn className="h-3.5 w-3.5" />,
        color: "text-[#5F5E5A]",
        bg: "bg-[#F1EFE8]",
    },
    order_shipped: {
        label: "Pesanan Dikirim",
        icon: <Package className="h-3.5 w-3.5" />,
        color: "text-[#854F0B]",
        bg: "bg-[#FAEEDA]",
    },
    payment_failed: {
        label: "Pembayaran Gagal",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        color: "text-[#A32D2D]",
        bg: "bg-[#FCEBEB]",
    },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const data: User[] = [
    {
        id: 1,
        name: "Rina Kartika",
        email: "rina.kartika@gmail.com",
        role: "admin",
        status: "active",
        email_verified_at: "2024-01-10T08:00:00Z",
        last_login_at: "2025-06-14T10:23:00Z",
        created_at: "2024-01-10T08:00:00Z",
        city: "Jakarta",
        lat: -6.2088,
        lng: 106.8456,
    },
    {
        id: 2,
        name: "Budi Santoso",
        email: "budi.santoso@yahoo.com",
        role: "editor",
        status: "active",
        email_verified_at: "2024-02-05T09:00:00Z",
        last_login_at: "2025-06-10T15:00:00Z",
        created_at: "2024-02-05T09:00:00Z",
        city: "Surabaya",
        lat: -7.2575,
        lng: 112.7521,
    },
    {
        id: 3,
        name: "Dewi Rahayu",
        email: "dewi.rahayu@outlook.com",
        role: "viewer",
        status: "inactive",
        email_verified_at: null,
        last_login_at: null,
        created_at: "2024-03-20T11:00:00Z",
        city: "Bandung",
        lat: -6.9175,
        lng: 107.6191,
    },
    {
        id: 4,
        name: "Andi Pratama",
        email: "andi.pratama@mail.id",
        role: "viewer",
        status: "banned",
        email_verified_at: "2024-04-01T07:00:00Z",
        last_login_at: "2025-05-01T08:00:00Z",
        created_at: "2024-04-01T07:00:00Z",
        city: "Medan",
        lat: 3.5952,
        lng: 98.6722,
    },
    {
        id: 5,
        name: "Siti Nurhaliza",
        email: "siti.nur@gmail.com",
        role: "viewer",
        status: "active",
        email_verified_at: "2024-05-12T10:00:00Z",
        last_login_at: "2025-06-13T09:00:00Z",
        created_at: "2024-05-12T10:00:00Z",
        city: "Yogyakarta",
        lat: -7.7956,
        lng: 110.3695,
    },
    {
        id: 6,
        name: "Reza Firmansyah",
        email: "reza.firm@gmail.com",
        role: "editor",
        status: "active",
        email_verified_at: "2024-06-01T08:00:00Z",
        last_login_at: "2025-06-14T08:30:00Z",
        created_at: "2024-06-01T08:00:00Z",
        city: "Makassar",
        lat: -5.1477,
        lng: 119.4327,
    },
    {
        id: 7,
        name: "Lina Marlina",
        email: "lina.mar@yahoo.com",
        role: "viewer",
        status: "inactive",
        email_verified_at: null,
        last_login_at: null,
        created_at: "2024-07-15T12:00:00Z",
        city: "Semarang",
        lat: -6.9667,
        lng: 110.4167,
    },
    {
        id: 8,
        name: "Hendra Gunawan",
        email: "hendra.g@gmail.com",
        role: "viewer",
        status: "active",
        email_verified_at: "2024-08-20T07:00:00Z",
        last_login_at: "2025-06-12T14:00:00Z",
        created_at: "2024-08-20T07:00:00Z",
        city: "Denpasar",
        lat: -8.6705,
        lng: 115.2126,
    },
];

const recentActivity: ActivityLog[] = [
    {
        id: 1,
        user: "Rina Kartika",
        type: "checkout",
        detail: "Menyelesaikan pesanan #ORD-2841",
        time: "2 menit lalu",
        amount: "Rp 345.000",
    },
    {
        id: 2,
        user: "Budi Santoso",
        type: "order_shipped",
        detail: "Pesanan #ORD-2839 sudah dikirim via JNE",
        time: "15 menit lalu",
    },
    {
        id: 3,
        user: "Hendra Gunawan",
        type: "checkout",
        detail: "Menyelesaikan pesanan #ORD-2840",
        time: "32 menit lalu",
        amount: "Rp 128.500",
    },
    {
        id: 4,
        user: "Pengguna baru",
        type: "register",
        detail: "Akun baru terdaftar dari Surabaya",
        time: "1 jam lalu",
    },
    {
        id: 5,
        user: "Andi Pratama",
        type: "payment_failed",
        detail: "Pembayaran gagal untuk pesanan #ORD-2835",
        time: "2 jam lalu",
        amount: "Rp 89.000",
    },
    {
        id: 6,
        user: "Siti Nurhaliza",
        type: "checkout",
        detail: "Menyelesaikan pesanan #ORD-2833",
        time: "3 jam lalu",
        amount: "Rp 215.000",
    },
    {
        id: 7,
        user: "Reza Firmansyah",
        type: "login",
        detail: "Login dari perangkat baru (MacOS – Chrome)",
        time: "4 jam lalu",
    },
    {
        id: 8,
        user: "Lina Marlina",
        type: "register",
        detail: "Akun baru terdaftar dari Semarang",
        time: "5 jam lalu",
    },
];

const userOrigins: UserOrigin[] = [
    { city: "Jakarta", count: 3, color: "#378ADD" },
    { city: "Surabaya", count: 2, color: "#639922" },
    { city: "Bandung", count: 2, color: "#BA7517" },
    { city: "Medan", count: 1, color: "#D4537E" },
    { city: "Yogyakarta", count: 2, color: "#7F77DD" },
    { city: "Makassar", count: 1, color: "#1D9E75" },
    { city: "Semarang", count: 1, color: "#D85A30" },
    { city: "Denpasar", count: 1, color: "#5F5E5A" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
    if (!dateStr) return <span className="text-muted-foreground text-xs">—</span>;
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

// ─── Computed Stats ───────────────────────────────────────────────────────────

const totalUsers = data.length;
const activeUsers = data.filter((u) => u.status === "active").length;
const inactiveUsers = data.filter((u) => u.status === "inactive").length;
const bannedUsers = data.filter((u) => u.status === "banned").length;
const adminUsers = data.filter((u) => u.role === "admin").length;
const editorUsers = data.filter((u) => u.role === "editor").length;
const viewerUsers = data.filter((u) => u.role === "viewer").length;
const verifiedUsers = data.filter((u) => u.email_verified_at !== null).length;
const unverifiedUsers = data.filter((u) => u.email_verified_at === null).length;
const recentRegistered = data.filter((u) => {
    const d = new Date(u.created_at);
    const cutoff = new Date("2024-05-01");
    return d >= cutoff;
}).length;

const totalCheckouts = recentActivity.filter((a) => a.type === "checkout").length;
const totalPaymentFailed = recentActivity.filter((a) => a.type === "payment_failed").length;
const maxOrigin = Math.max(...userOrigins.map((o) => o.count));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon,
    sub,
    accent,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    sub?: string;
    accent?: string;
}) {
    return (
        <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                <span className={`p-1.5 rounded-lg ${accent ?? "bg-muted"}`}>{icon}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold">{value}</span>
                {sub && <span className="text-xs text-muted-foreground mb-0.5">{sub}</span>}
            </div>
        </div>
    );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-base font-semibold">{title}</h2>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── Leaflet Map ─────────────────────────────────────────────────────────────

function UserMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (mapInstanceRef.current) return;

        const L = require("leaflet");

        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current!, {
            center: [-2.5, 118],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: false,
        });

        // Dark tile layer (CartoDB Dark Matter)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
        }).addTo(map);

        // Custom circle marker for each user
        data.forEach((user) => {
            const roleColors: Record<UserRole, string> = {
                admin: "#7F77DD",
                editor: "#378ADD",
                viewer: "#639922",
            };
            const statusColors: Record<UserStatus, string> = {
                active: "#639922",
                inactive: "#888780",
                banned: "#E24B4A",
            };

            const circle = L.circleMarker([user.lat, user.lng], {
                radius: 9,
                fillColor: statusColors[user.status],
                color: "#fff",
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.85,
            }).addTo(map);

            circle.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${user.name}</div>
                    <div style="font-size: 11px; color: #888; margin-bottom: 6px;">${user.email}</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: ${statusColors[user.status]}22; color: ${statusColors[user.status]}; font-weight: 500;">${user.status}</span>
                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: ${roleColors[user.role]}22; color: ${roleColors[user.role]}; font-weight: 500;">${user.role}</span>
                    </div>
                    <div style="font-size: 11px; color: #666; margin-top: 6px;">📍 ${user.city}</div>
                </div>
            `);
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div
            ref={mapRef}
            className="w-full rounded-xl overflow-hidden border border-border/40"
            style={{ height: 380 }}
        />
    );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "ID",
        size: 50,
        cell: ({ row }) => (
            <span className="text-muted-foreground text-xs">#{row.original.id}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Pengguna",
        cell: ({ row }) => {
            const { name, email, city } = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {getInitials(name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{name}</span>
                        <span className="text-xs text-muted-foreground truncate">{email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "city",
        header: "Kota",
        cell: ({ row }) => (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {row.original.city}
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const cfg = roleConfig[row.original.role];
            return (
                <Badge className={`text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const cfg = statusConfig[row.original.status];
            return (
                <Badge className={`text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "email_verified_at",
        header: "Verifikasi",
        cell: ({ row }) => {
            const verified = !!row.original.email_verified_at;
            return verified ? (
                <ShieldCheck className="h-4 w-4 text-[#3B6D11]" />
            ) : (
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
            );
        },
    },
    {
        accessorKey: "last_login_at",
        header: "Login terakhir",
        cell: ({ row }) => (
            <span className="text-sm">{formatDate(row.original.last_login_at)}</span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Bergabung",
        cell: ({ row }) => (
            <span className="text-sm">{formatDate(row.original.created_at)}</span>
        ),
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Edit"
                        onClick={() => console.log("edit", user.id)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Reset password"
                        onClick={() => console.log("reset password", user.id)}
                    >
                        <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Hapus"
                        onClick={() => console.log("delete", user.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        },
    },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperadminDashboard() {
    return (
        <div className="w-full p-6 md:p-10 space-y-10 max-w-[1400px] mx-auto">

            {/* ── Header ── */}
            <div>
                <h1 className="text-xl font-semibold">Dashboard Superadmin</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Ringkasan aktivitas platform, pengguna, dan transaksi terbaru.
                </p>
            </div>

            {/* ── Section: User Stats ── */}
            <section>
                <SectionTitle
                    title="Statistik Pengguna"
                    sub="Ringkasan kondisi seluruh akun pengguna di platform"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatCard
                        label="Total Pengguna"
                        value={totalUsers}
                        icon={<Users className="h-4 w-4 text-[#185FA5]" />}
                        accent="bg-[#E6F1FB]"
                        sub="semua role"
                    />
                    <StatCard
                        label="Pengguna Aktif"
                        value={activeUsers}
                        icon={<UserCheck className="h-4 w-4 text-[#3B6D11]" />}
                        accent="bg-[#EAF3DE]"
                        sub={`${Math.round((activeUsers / totalUsers) * 100)}% dari total`}
                    />
                    <StatCard
                        label="Nonaktif"
                        value={inactiveUsers}
                        icon={<UserMinus className="h-4 w-4 text-[#5F5E5A]" />}
                        accent="bg-[#F1EFE8]"
                    />
                    <StatCard
                        label="Dibanned"
                        value={bannedUsers}
                        icon={<UserX className="h-4 w-4 text-[#A32D2D]" />}
                        accent="bg-[#FCEBEB]"
                    />
                    <StatCard
                        label="Belum Verifikasi"
                        value={unverifiedUsers}
                        icon={<ShieldOff className="h-4 w-4 text-[#854F0B]" />}
                        accent="bg-[#FAEEDA]"
                        sub="email belum konfirmasi"
                    />
                </div>

                {/* Role breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <StatCard
                        label="Admin"
                        value={adminUsers}
                        icon={<ShieldCheck className="h-4 w-4 text-[#3C3489]" />}
                        accent="bg-[#EEEDFE]"
                    />
                    <StatCard
                        label="Editor"
                        value={editorUsers}
                        icon={<Pencil className="h-4 w-4 text-[#185FA5]" />}
                        accent="bg-[#E6F1FB]"
                    />
                    <StatCard
                        label="Viewer / Customer"
                        value={viewerUsers}
                        icon={<Users className="h-4 w-4 text-[#854F0B]" />}
                        accent="bg-[#FAEEDA]"
                    />
                    <StatCard
                        label="Registrasi Baru"
                        value={recentRegistered}
                        icon={<TrendingUp className="h-4 w-4 text-[#3B6D11]" />}
                        accent="bg-[#EAF3DE]"
                        sub="sejak Mei 2024"
                    />
                </div>
            </section>

            {/* ── Section: eCommerce Stats ── */}
            <section>
                <SectionTitle
                    title="Statistik Transaksi"
                    sub="Aktivitas belanja dan transaksi hari ini"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                        label="Checkout Hari Ini"
                        value={totalCheckouts}
                        icon={<ShoppingCart className="h-4 w-4 text-[#185FA5]" />}
                        accent="bg-[#E6F1FB]"
                        sub="dari aktivitas terbaru"
                    />
                    <StatCard
                        label="Pembayaran Gagal"
                        value={totalPaymentFailed}
                        icon={<CreditCard className="h-4 w-4 text-[#A32D2D]" />}
                        accent="bg-[#FCEBEB]"
                    />
                    <StatCard
                        label="Total Transaksi"
                        value="Rp 688.500"
                        icon={<BarChart2 className="h-4 w-4 text-[#3B6D11]" />}
                        accent="bg-[#EAF3DE]"
                        sub="dari checkout berhasil"
                    />
                    <StatCard
                        label="Pesanan Dikirim"
                        value={recentActivity.filter((a) => a.type === "order_shipped").length}
                        icon={<Package className="h-4 w-4 text-[#854F0B]" />}
                        accent="bg-[#FAEEDA]"
                        sub="hari ini"
                    />
                </div>
            </section>

            {/* ── Section: Map + Activity (2 col) ── */}
            <section>
                <SectionTitle
                    title="Peta Sebaran & Aktivitas Terbaru"
                    sub="Lokasi pengguna terdaftar dan log aktivitas real-time"
                />
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

                    {/* Map */}
                    <div>
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#639922]" />
                                Aktif
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#888780]" />
                                Nonaktif
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#E24B4A]" />
                                Banned
                            </div>
                        </div>
                        <UserMap />
                    </div>

                    {/* Activity Log */}
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                            <span className="text-sm font-medium">Aktivitas Terbaru</span>
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="overflow-y-auto flex-1" style={{ maxHeight: 360 }}>
                            {recentActivity.map((act) => {
                                const cfg = activityConfig[act.type];
                                return (
                                    <div
                                        key={act.id}
                                        className="flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-0"
                                    >
                                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${cfg.bg} ${cfg.color}`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-medium truncate">{act.user}</span>
                                                {act.amount && (
                                                    <span className="text-xs font-semibold text-[#3B6D11] shrink-0">
                                                        {act.amount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                {act.detail}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                                {act.time}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section: User Origin Breakdown ── */}
            <section>
                <SectionTitle
                    title="Sebaran Kota Pengguna"
                    sub="Distribusi pengguna berdasarkan kota asal"
                />
                <div className="rounded-xl border border-border/40 bg-card p-5">
                    <div className="space-y-3">
                        {userOrigins
                            .sort((a, b) => b.count - a.count)
                            .map((origin) => (
                                <div key={origin.city} className="flex items-center gap-3">
                                    <span className="text-sm w-24 shrink-0 text-muted-foreground">
                                        {origin.city}
                                    </span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(origin.count / maxOrigin) * 100}%`,
                                                backgroundColor: origin.color,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium w-6 text-right">{origin.count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </section>

            {/* ── Section: User Table ── */}
            <section>
                <SectionTitle
                    title="Manajemen Pengguna"
                    sub="Daftar lengkap seluruh pengguna, bisa difilter dan dicari"
                />
                <DataTable
                    columns={columns}
                    data={data}
                    filterFields={[
                        { value: "name", placeholder: "Cari nama atau email..." },
                        {
                            value: "role",
                            options: [
                                { label: "Admin", value: "admin" },
                                { label: "Editor", value: "editor" },
                                { label: "Viewer", value: "viewer" },
                            ],
                        },
                        {
                            value: "status",
                            options: [
                                { label: "Aktif", value: "active" },
                                { label: "Nonaktif", value: "inactive" },
                                { label: "Banned", value: "banned" },
                            ],
                        },
                    ]}
                />
            </section>

        </div>
    );
}