"use client";

import CreateModal from "@/components/CreateModal";
import DeleteModal from "@/components/DeleteModal";
import EditModal from "@/components/EditModal";
import { ProductForm } from "@/components/forms/ProductForm";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import {
  deleteProducts,
  getProducts,
  getStockMovements,
} from "@/services/product.service";
import { Product } from "@/types/product";
import { AdminReview } from "@/types/product-review";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { goeyToast } from "goey-toast";
import {
  Pencil,
  Trash2,
  Package,
  CheckCircle2,
  Archive,
  AlertTriangle,
  TrendingUp,
  Layers,
  Info,
  Sparkles,
  Box,
  DollarSign,
  ShoppingBag,
  StarIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  published: "#10b981",
  draft: "#f59e0b",
  archived: "#f43f5e",
};

const CATEGORY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

export default function Products() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: stockMovementData,
    isLoading: isStockMovementLoading,
    error: stockMovementError,
  } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: getStockMovements,
    staleTime: 1000 * 60 * 5,
  });

  // console.log("STOCK MOVEMENTS:", stockMovementData);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "products",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
    ],
    queryFn: () =>
      getProducts(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearch,
      ),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setOpenEditModal(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
    setOpenDeleteModal(true);
  };

  const productsData = data?.data ?? [];

  const stats = useMemo(() => {
    const list = productsData as Product[];
    const total = data?.total ?? list.length;
    const published = list.filter(
      (p) => p.is_active === "published" || (p as any).status === "published",
    ).length;
    const draft = list.filter(
      (p) => p.is_active === "draft" || (p as any).status === "draft",
    ).length;
    const archived = list.filter(
      (p) => p.is_active === "archived" || (p as any).status === "archived",
    ).length;
    const lowStock = list.filter((p) => Number(p.stock) <= 5).length;
    const totalStock = list.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const totalValue = list.reduce(
      (acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0,
    );
    const avgPrice =
      list.length > 0
        ? list.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / list.length
        : 0;

    return {
      total,
      published,
      draft,
      archived,
      lowStock,
      totalStock,
      totalValue,
      avgPrice,
    };
  }, [productsData, data]);

  const chartData = useMemo(() => {
    if (!stockMovementData) return [];
    return stockMovementData.map((item) => ({
      name: item.date,
      stok: item.stock,
      nilai: item.value,
    }));
  }, [stockMovementData]);

  // Chart data: distribusi status
  const statusChartData = useMemo(() => {
    return [
      {
        name: "Published",
        value: stats.published,
        color: STATUS_COLORS.published,
      },
      { name: "Draft", value: stats.draft, color: STATUS_COLORS.draft },
      {
        name: "Archived",
        value: stats.archived,
        color: STATUS_COLORS.archived,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Chart data: distribusi kategori
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    (productsData as Product[]).forEach((p) => {
      const cat = p.category || "Lainnya";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [productsData]);

  // Chart data: top produk berdasarkan nilai stok
  const topValueChartData = useMemo(() => {
    return (productsData as Product[])
      .map((p) => ({
        name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title,
        nilai: (Number(p.price) || 0) * (Number(p.stock) || 0),
      }))
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 6);
  }, [productsData]);

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <SectionTitle
          title="Manajemen Produk"
          sub="Daftar lengkap seluruh produk, bisa difilter dan dicari"
        />

        <CreateModal
          title="Tambah Produk Baru"
          description="Tambah dan buat produk baru untuk di display"
          url="http://localhost:8080/api/admin/products"
          trigger={
            <Button className="gap-2 shadow-sm">
              <Package className="h-4 w-4" />
              Tambah Produk
              
            </Button>
          }
        >
          {openEditModal && selectedProduct && (
            <ProductForm
              key={selectedProduct.id}
              mode="edit"
              product={selectedProduct}
              url={`http://localhost:8080/api/admin/products/${selectedProduct.id}`}
              onSuccess={() => {
                setOpenEditModal(false);
                setSelectedProduct(null);
              }}
            />
          )}        </CreateModal>
      </div>

      {/* ===== STATS BAR ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Total Produk
            </span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Semua produk</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Published
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600">
            {stats.published}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Aktif di toko
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Draft
            </span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-amber-600">
            {stats.draft}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Belum dipublish
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Archived
            </span>
            <Archive className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-600">
            {stats.archived}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Tidak aktif</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Stok Rendah
            </span>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-orange-600">
            {stats.lowStock}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">≤ 5 unit</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Total Stok
            </span>
            <Box className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {stats.totalStock}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Unit tersedia
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Nilai Stok
            </span>
            <DollarSign className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {stats.totalValue >= 1_000_000
              ? `${(stats.totalValue / 1_000_000).toFixed(1)}jt`
              : stats.totalValue.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Estimasi nilai
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Rata-rata Harga
            </span>
            <ShoppingBag className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {stats.avgPrice >= 1_000_000
              ? `${(stats.avgPrice / 1_000_000).toFixed(1)}jt`
              : Math.round(stats.avgPrice).toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Per produk</p>
        </div>
      </div>

      {/* ===== CHARTS SECTION ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area Chart - Pergerakan Stok & Nilai */}
        <div className="xl:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">Pergerakan Stok & Nilai</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                7 hari terakhir (estimasi)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Stok</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Nilai</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorStok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNilai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stok"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorStok)"
                />
                <Area
                  type="monotone"
                  dataKey="nilai"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorNilai)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart - Status Distribusi */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Distribusi Status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proporsi status produk
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== SECOND ROW CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart - Kategori */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Distribusi Kategori</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jumlah produk per kategori
            </p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {categoryChartData.map((_, index) => (
                    <Cell
                      key={`cat-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar - Top Produk by Nilai */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Top Produk (Nilai Stok)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              6 produk dengan nilai stok tertinggi
            </p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topValueChartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}jt`
                      : v.toLocaleString("id-ID")
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => {
                    const numericValue =
                      typeof value === "number" ? value : Number(value ?? 0);

                    return [
                      `Rp ${numericValue.toLocaleString("id-ID")}`,
                      "Nilai",
                    ];
                  }}
                  cursor={{ fill: "rgba(139, 92, 246, 0.06)" }}
                />
                <Bar
                  dataKey="nilai"
                  fill="#8b5cf6"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== MAIN + RIGHT SIDEBAR ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* LEFT: Table + Modals */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <EditModal
              open={openEditModal}
              onOpenChange={setOpenEditModal}
              title="Edit Produk"
              description="Perbarui informasi produk"
            >
              {openEditModal && selectedProduct && (
                <ProductForm
                  key={selectedProduct.id}
                  mode="edit"
                  product={selectedProduct}
                  url={`http://localhost:8080/api/admin/products/${selectedProduct.id}`}
                />
              )}
            </EditModal>
          </div>

          <DeleteModal
            open={openDeleteModal}
            onOpenChange={setOpenDeleteModal}
            title="Hapus Produk"
            description={`Apakah kamu yakin ingin menghapus ${deleteTarget?.title}?`}
          >
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;

                try {
                  await deleteProducts(deleteTarget.id);
                  await queryClient.invalidateQueries({
                    queryKey: ["products"],
                  });
                  goeyToast.success("Produk Berhasil Dihapus!");
                  setOpenDeleteModal(false);
                } catch (err) {
                  goeyToast.error(
                    err instanceof Error
                      ? err.message
                      : "Produk gagal dihapus!",
                  );
                }
              }}
            >
              Hapus
            </Button>
          </DeleteModal>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
                  render: (product) => <span>{product.category}</span>,
                },
                {
                  type: "custom",
                  header: "Harga",
                  render: (product) => (
                    <span>Rp {product.price.toLocaleString("id-ID")}</span>
                  ),
                },
                {
                  type: "custom",
                  header: "Stok",
                  render: (product) => (
                    <span
                      className={
                        Number(product.stock) <= 5
                          ? "text-orange-600 font-medium"
                          : ""
                      }
                    >
                      {product.stock}
                    </span>
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
                  type: "custom",
                  header: "Unggulan",
                  render: (product) => {
                    return (
                      <div>
                        <span>
                          {product.is_featured ? "Unggulan" : "Tidak"}
                        </span>
                      </div>
                    );
                  },
                },
                {
                  type: "custom",
                  header: "Sold",
                  render: (product) => <span>{product.sold}</span>,
                },
                {
                  type: "custom",
                  header: "Size",
                  render: (product) => (
                    <span>
                      {product.size?.map((item) => item.size).join(", ") || "-"}
                    </span>
                  ),
                },
                {
                  type: "custom",
                  header: "Discount",
                  render: (product) => (
                    <div>
                      {product.discounts?.length
                        ? product.discounts.map((discount, index) =>
                          discount?.code ? (
                            <div
                              key={discount.id ?? `${discount.code}-${index}`}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">
                                {discount.code} -
                              </span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {discount.type === "percentage"
                                  ? `Diskon ${discount.value}%`
                                  : `Potongan Rp ${discount.value.toLocaleString("id-ID")}`}
                              </span>
                            </div>
                          ) : (
                            <span
                              key={index}
                              className="text-sm text-muted-foreground"
                            >
                              Tidak ada diskon
                            </span>
                          ),
                        )
                        : "-"}
                    </div>
                  ),
                },
                {
                  type: "custom",
                  header: "Review",
                  render: (product: Product) => {
                    const reviews = product.reviews ?? [];

                    if (reviews.length === 0) {
                      return (
                        <span className="text-black/60 text-sm">
                          Belum ada review
                        </span>
                      );
                    }

                    const average =
                      reviews.reduce(
                        (total, review) => total + review.rating,
                        0,
                      ) / reviews.length;

                    return (
                      <span className="flex items-center gap-2">
                        <StarIcon size={15} /> {average.toFixed(1)}
                        <span className="text-red-700">({reviews.length})</span>
                      </span>
                    );
                  },
                },
                {
                  type: "date",
                  header: "Dibuat",
                  key: "created_at",
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

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className="space-y-4 xl:sticky xl:top-6">
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm">Tips Cepat</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Pastikan stok selalu ≥ 5 agar tidak muncul di daftar “Stok
                  Rendah”.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Gunakan status <strong>Draft</strong> dulu sebelum publish ke
                  publik.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Thumbnail berkualitas tinggi = produk lebih menarik di
                  etalase.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Info Halaman</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-dashed">
                <span className="text-muted-foreground">Halaman saat ini</span>
                <span className="font-medium">{pagination.pageIndex + 1}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-dashed">
                <span className="text-muted-foreground">Per halaman</span>
                <span className="font-medium">{pagination.pageSize}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-dashed">
                <span className="text-muted-foreground">Total halaman</span>
                <span className="font-medium">{data?.totalPages ?? 1}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Pencarian aktif</span>
                <span className="font-medium truncate max-w-[120px]">
                  {debouncedSearch || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Legenda Status</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">
                  Published — tampil di toko
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                <span className="text-muted-foreground">
                  Draft — masih disimpan
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">
                  Archived — tidak aktif
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              <h3 className="font-semibold text-sm text-violet-700 dark:text-violet-300">
                Performa
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jaga produk agar selalu <strong>Published</strong> dan stok
              terisi. Produk dengan stok rendah cenderung lebih sulit terjual.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
