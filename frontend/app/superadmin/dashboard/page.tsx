"use client";

import { useEffect, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
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
import { statusConfig } from "@/config/statusConfig";
import { roleConfig } from "@/config/roleConfig";
import { User, UserStatus } from "@/types/user";
import { ActivityLog } from "@/types/activity-log";
import { UserOrigin } from "@/types/user-origin";
import { formatDate } from "@/helper/formatDate";
import { activityConfig } from "@/config/activityConfig";
import { getInitials } from "@/helper/getInitials";
import { data } from "@/data/user-data";
import StatCard from "@/components/StatCards";
import SectionTitle from "@/components/SectionTitle";
import UserMap from "@/components/UserMap"; 
import { columns } from "@/components/ui/table/columns";


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


const totalCheckouts = recentActivity.filter((a) => a.type === "checkout").length;
const totalPaymentFailed = recentActivity.filter((a) => a.type === "payment_failed").length;
const maxOrigin = Math.max(...userOrigins.map((o) => o.count));


export default function SuperadminDashboard() {
    return (
        <div className="w-full p-6 md:p-10 space-y-10 max-w-[1400px] mx-auto">
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

                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                            <span className="text-sm font-medium">Aktivitas Terbaru</span>
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="overflow-y-auto flex-1" style={{ maxHeight: 360 }}>
                            {recentActivity.map((act) => {
                                const cfg = activityConfig
                                [act.type];
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

        </div>
    );
}