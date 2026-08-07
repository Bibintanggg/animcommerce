"use client"

import { useMemo } from "react"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts"
import {
    Package,
    TrendingUp,
    ShoppingCart,
    Users,
    DollarSign,
    Eye,
    AlertTriangle,
    CheckCircle2,
    Layers,
    Activity,
    Zap,
    Box,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
} from "lucide-react"
import { Product } from "@/types/product"

// ============ DUMMY DATA ============
const REVENUE_TREND = [
    { name: "00:00", revenue: 12.4, orders: 18, visitors: 420 },
    { name: "04:00", revenue: 8.1, orders: 11, visitors: 280 },
    { name: "08:00", revenue: 19.6, orders: 34, visitors: 890 },
    { name: "12:00", revenue: 31.2, orders: 52, visitors: 1420 },
    { name: "16:00", revenue: 28.7, orders: 47, visitors: 1180 },
    { name: "20:00", revenue: 36.9, orders: 61, visitors: 1650 },
    { name: "23:59", revenue: 24.3, orders: 39, visitors: 980 },
]

const WEEKLY_SALES = [
    { name: "Sen", sales: 42, target: 50 },
    { name: "Sel", sales: 58, target: 50 },
    { name: "Rab", sales: 49, target: 50 },
    { name: "Kam", sales: 67, target: 50 },
    { name: "Jum", sales: 72, target: 55 },
    { name: "Sab", sales: 89, target: 60 },
    { name: "Min", sales: 76, target: 55 },
]

const CATEGORY_PERFORMANCE = [
    { subject: "Elektronik", A: 92, fullMark: 100 },
    { subject: "Fashion", A: 78, fullMark: 100 },
    { subject: "Makanan", A: 65, fullMark: 100 },
    { subject: "Kesehatan", A: 84, fullMark: 100 },
    { subject: "Rumah", A: 71, fullMark: 100 },
    { subject: "Olahraga", A: 58, fullMark: 100 },
]

const TOP_PRODUCTS_DUMMY = [
    { name: "Wireless Earbuds Pro", sales: 1240, revenue: 186, growth: 12.4 },
    { name: "Smart Watch X3", sales: 980, revenue: 245, growth: 8.7 },
    { name: "Gaming Keyboard RGB", sales: 860, revenue: 129, growth: -2.1 },
    { name: "USB-C Hub 7-in-1", sales: 720, revenue: 86, growth: 15.3 },
    { name: "Noise Cancelling HP", sales: 650, revenue: 195, growth: 5.9 },
]

// ============ CUSTOM TOOLTIP (Light Futuristic) ============
const NeonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-cyan-200 bg-white/95 backdrop-blur-xl px-4 py-3 shadow-xl shadow-cyan-500/10 text-xs">
            <p className="font-medium text-cyan-700 mb-2 tracking-wide">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                    <div className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-500 capitalize">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 tabular-nums">
                        {typeof entry.value === "number"
                            ? entry.value.toLocaleString("id-ID")
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ============ KPI CARD ============
function KpiCard({
    title,
    value,
    sub,
    icon: Icon,
    trend,
    trendValue,
    accent = "cyan",
}: {
    title: string
    value: string | number
    sub?: string
    icon: any
    trend?: "up" | "down"
    trendValue?: string
    accent?: "cyan" | "emerald" | "violet" | "amber" | "rose"
}) {
    const accents = {
        cyan: "from-cyan-50 to-white border-cyan-100 text-cyan-600 shadow-cyan-100/50",
        emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-600 shadow-emerald-100/50",
        violet: "from-violet-50 to-white border-violet-100 text-violet-600 shadow-violet-100/50",
        amber: "from-amber-50 to-white border-amber-100 text-amber-600 shadow-amber-100/50",
        rose: "from-rose-50 to-white border-rose-100 text-rose-600 shadow-rose-100/50",
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accents[accent]} p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md`}
        >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-current opacity-[0.06] blur-2xl" />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                    {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {trend && trendValue && (
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                    {trend === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span className={trend === "up" ? "text-emerald-600" : "text-rose-600"}>
                        {trendValue}
                    </span>
                    <span className="text-slate-400">vs kemarin</span>
                </div>
            )}
        </div>
    )
}

// ============ MAIN DASHBOARD ============
export default function ProductDashboard({ products = [] as Product[] }) {
    const productStats = useMemo(() => {
        const list = products
        const total = list.length
        const published = list.filter((p) => p.is_active === "published").length
        const draft = list.filter((p) => p.is_active === "draft").length
        const archived = list.filter((p) => p.is_active === "archived").length
        const lowStock = list.filter((p) => Number(p.stock) <= 5).length
        const totalStock = list.reduce((a, p) => a + (Number(p.stock) || 0), 0)
        const totalValue = list.reduce(
            (a, p) => a + (Number(p.price) || 0) * (Number(p.stock) || 0),
            0
        )
        const avgPrice =
            list.length > 0
                ? list.reduce((a, p) => a + (Number(p.price) || 0), 0) / list.length
                : 0

        return { total, published, draft, archived, lowStock, totalStock, totalValue, avgPrice }
    }, [products])

    const statusData = useMemo(
        () =>
            [
                { name: "Published", value: productStats.published || 42, color: "#10b981" },
                { name: "Draft", value: productStats.draft || 18, color: "#f59e0b" },
                { name: "Archived", value: productStats.archived || 9, color: "#f43f5e" },
            ].filter((d) => d.value > 0),
        [productStats]
    )

    const stockHealth = useMemo(() => {
        const base = productStats.totalStock || 1200
        return [
            { name: "Sen", sehat: Math.round(base * 0.88), rendah: Math.round(base * 0.12) },
            { name: "Sel", sehat: Math.round(base * 0.91), rendah: Math.round(base * 0.09) },
            { name: "Rab", sehat: Math.round(base * 0.86), rendah: Math.round(base * 0.14) },
            { name: "Kam", sehat: Math.round(base * 0.93), rendah: Math.round(base * 0.07) },
            { name: "Jum", sehat: Math.round(base * 0.89), rendah: Math.round(base * 0.11) },
            { name: "Sab", sehat: Math.round(base * 0.95), rendah: Math.round(base * 0.05) },
            { name: "Min", sehat: Math.round(base * 0.92), rendah: Math.round(base * 0.08) },
        ]
    }, [productStats.totalStock])

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Soft background accents */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-cyan-100/40 blur-[120px]" />
                <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-[100px]" />
                <div className="absolute bottom-0 left-1/3 h-[300px] w-[600px] rounded-full bg-emerald-100/30 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1600px] space-y-8 p-6 md:p-10">
                {/* ===== HEADER ===== */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-100">
                                <Activity className="h-4 w-4 text-cyan-600" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                Product Command Center
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Real-time monitoring •{" "}
                            {new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Live
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                            Last sync: just now
                        </div>
                    </div>
                </div>

                {/* ===== KPI GRID ===== */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Revenue"
                        value="Rp 248.6jt"
                        sub="Hari ini"
                        icon={DollarSign}
                        trend="up"
                        trendValue="+12.4%"
                        accent="cyan"
                    />
                    <KpiCard
                        title="Orders"
                        value="1,284"
                        sub="Transaksi hari ini"
                        icon={ShoppingCart}
                        trend="up"
                        trendValue="+8.1%"
                        accent="emerald"
                    />
                    <KpiCard
                        title="Active Products"
                        value={productStats.published || 186}
                        sub={`${productStats.total || 247} total produk`}
                        icon={Package}
                        trend="up"
                        trendValue="+3.2%"
                        accent="violet"
                    />
                    <KpiCard
                        title="Low Stock Alert"
                        value={productStats.lowStock || 14}
                        sub="Perlu restock segera"
                        icon={AlertTriangle}
                        trend="down"
                        trendValue="-2"
                        accent="rose"
                    />
                </div>

                {/* ===== SECOND KPI ROW ===== */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {[
                        { icon: Users, label: "Visitors", value: "8,420", sub: "+18% hari ini", subColor: "text-emerald-600" },
                        { icon: Eye, label: "Page Views", value: "24.1k", sub: "+9.4%", subColor: "text-emerald-600" },
                        { icon: Box, label: "Total Stock", value: productStats.totalStock.toLocaleString("id-ID") || "12.4k", sub: "unit tersedia", subColor: "text-slate-500" },
                        { icon: Zap, label: "Conversion", value: "4.8%", sub: "+0.6%", subColor: "text-emerald-600" },
                        { icon: CheckCircle2, label: "Published", value: productStats.published || 186, sub: "aktif di toko", subColor: "text-slate-500" },
                        { icon: Layers, label: "Draft", value: productStats.draft || 18, sub: "menunggu review", subColor: "text-slate-500" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-slate-500">
                                <item.icon className="h-3.5 w-3.5" />
                                <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                            </div>
                            <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
                            <p className={`text-[11px] ${item.subColor}`}>{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ===== MAIN CHARTS ===== */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    {/* Revenue & Orders */}
                    <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Revenue & Orders Flow</h3>
                                <p className="text-xs text-slate-500 mt-0.5">24 jam terakhir • real-time</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                                    <span className="text-slate-500">Revenue (jt)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                                    <span className="text-slate-500">Orders</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <Tooltip content={<NeonTooltip />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        name="revenue"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        fill="url(#revGrad)"
                                        activeDot={{ r: 5, strokeWidth: 0, fill: "#06b6d4" }}
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="orders"
                                        name="orders"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#ordGrad)"
                                        activeDot={{ r: 5, strokeWidth: 0, fill: "#8b5cf6" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Donut */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-900">Product Status</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Distribusi status produk</p>
                        </div>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<NeonTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-center gap-5 text-xs">
                            {statusData.map((s) => (
                                <div key={s.name} className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-slate-500">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== THIRD ROW ===== */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* Weekly Sales */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <h3 className="font-semibold text-slate-900">Weekly Sales vs Target</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Performa penjualan minggu ini</p>
                        </div>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={WEEKLY_SALES} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <Tooltip content={<NeonTooltip />} cursor={{ fill: "rgba(6,182,212,0.06)" }} />
                                    <Bar dataKey="target" name="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                    <Bar dataKey="sales" name="sales" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stock Health */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Stock Health</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Sehat vs low stock</p>
                            </div>
                            <div className="flex gap-3 text-[10px]">
                                <div className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-slate-500">Sehat</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                    <span className="text-slate-500">Rendah</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stockHealth} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="sehatG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="rendahG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <Tooltip content={<NeonTooltip />} />
                                    <Area type="monotone" dataKey="sehat" name="sehat" stroke="#10b981" strokeWidth={2} fill="url(#sehatG)" />
                                    <Area type="monotone" dataKey="rendah" name="rendah" stroke="#f43f5e" strokeWidth={2} fill="url(#rendahG)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Radar */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <h3 className="font-semibold text-slate-900">Category Performance</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Skor performa per kategori</p>
                        </div>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={CATEGORY_PERFORMANCE}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Score"
                                        dataKey="A"
                                        stroke="#06b6d4"
                                        fill="#06b6d4"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                    <Tooltip content={<NeonTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM SECTION ===== */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                    {/* Top Products */}
                    <div className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Top Performing Products</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Berdasarkan penjualan 7 hari terakhir</p>
                            </div>
                            <Sparkles className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div className="space-y-3">
                            {TOP_PRODUCTS_DUMMY.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-cyan-200 hover:bg-cyan-50/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {item.sales.toLocaleString("id-ID")} terjual
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-cyan-600">
                                            Rp {item.revenue}jt
                                        </p>
                                        <p
                                            className={`text-[11px] ${
                                                item.growth >= 0 ? "text-emerald-600" : "text-rose-600"
                                            }`}
                                        >
                                            {item.growth >= 0 ? "+" : ""}
                                            {item.growth}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts & Snapshot */}
                    <div className="xl:col-span-2 space-y-5">
                        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4 text-rose-500" />
                                <h3 className="font-semibold text-sm text-rose-700">Critical Alerts</h3>
                            </div>
                            <ul className="space-y-2.5 text-xs text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span>
                                    <span>
                                        <strong className="text-rose-700">{productStats.lowStock || 14} produk</strong>{" "}
                                        stok ≤ 5 unit
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    <span>3 produk mendekati expired dalam 7 hari</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span>
                                    <span>Wireless Earbuds Pro hampir sold out</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="font-semibold text-sm text-slate-900 mb-4">Inventory Snapshot</h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Value</span>
                                    <span className="font-medium text-slate-900">
                                        {productStats.totalValue
                                            ? `Rp ${(productStats.totalValue / 1_000_000).toFixed(1)}jt`
                                            : "Rp 482jt"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Avg. Price</span>
                                    <span className="font-medium text-slate-900">
                                        {productStats.avgPrice
                                            ? `Rp ${Math.round(productStats.avgPrice).toLocaleString("id-ID")}`
                                            : "Rp 189.000"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Archived</span>
                                    <span className="font-medium text-rose-600">
                                        {productStats.archived || 9}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Stock Health Score</span>
                                    <span className="font-medium text-emerald-600">87/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-cyan-600" />
                                <h3 className="font-semibold text-sm text-cyan-700">AI Insight</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Penjualan kategori <strong className="text-cyan-700">Elektronik</strong> naik
                                signifikan. Pertimbangkan restock item top-seller sebelum weekend untuk
                                maksimalkan revenue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}