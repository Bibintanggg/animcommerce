"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

export type ShipmentStatus = "awaiting-pickup" | "transit" | "delivered";
export type StatusOrder = "pending" | "processing" | "cancelled" | "completed";

type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type TrackingEvent = {
  time: string;
  title: string;
  desc?: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  orderStatus: StatusOrder;
  shipmentStatus: ShipmentStatus;
  total: number;
  shippingFee: number;
  courier: string;
  trackingNumber: string;
  address: string;
  recipient: string;
  note?: string;
  placedAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  lat: number;
  lng: number;
  history: TrackingEvent[];
};

const ORDERS: Order[] = [
  {
    id: "ORD-8821",
    items: [
      { name: "Sony WH-1000XM5", qty: 1, price: 1299000 },
      { name: "Case Pelindung Soft", qty: 1, price: 89000 },
    ],
    orderStatus: "processing",
    shipmentStatus: "awaiting-pickup",
    total: 1388000,
    shippingFee: 18000,
    courier: "JNE YES",
    trackingNumber: "JX1234567890",
    address: "Jl. Melawai Raya No. 12, Kebayoran Baru, Jakarta Selatan 12160",
    recipient: "Andi Pratama",
    note: "Tolong dibungkus bubble wrap ekstra",
    placedAt: "23 Agu 2026, 10:12",
    updatedAt: "23 Agu 2026, 14:20",
    estimatedDelivery: "25 Agu 2026",
    lat: -6.2431,
    lng: 106.7995,
    history: [
      { time: "23 Agu, 14:20", title: "Paket siap dijemput", desc: "Menunggu kurir JNE YES" },
      { time: "23 Agu, 11:05", title: "Dikemas oleh penjual", desc: "Packing selesai" },
      { time: "23 Agu, 10:12", title: "Pesanan dikonfirmasi", desc: "Pembayaran berhasil" },
    ],
  },
  {
    id: "ORD-8794",
    items: [{ name: "Keychron Q1 Pro", qty: 1, price: 1898000 }],
    orderStatus: "processing",
    shipmentStatus: "transit",
    total: 1916000,
    shippingFee: 18000,
    courier: "SiCepat Gokil",
    trackingNumber: "SC9876543210",
    address: "Komplek Permata Hijau Blok C2, Jakarta Barat",
    recipient: "Andi Pratama",
    placedAt: "21 Agu 2026, 16:40",
    updatedAt: "22 Agu 2026, 09:15",
    estimatedDelivery: "24 Agu 2026",
    lat: -6.2205,
    lng: 106.7821,
    history: [
      { time: "22 Agu, 09:15", title: "Dalam perjalanan", desc: "Paket meninggalkan hub Jakarta Barat" },
      { time: "22 Agu, 06:40", title: "Tiba di sorting center", desc: "Jakarta Barat SC" },
      { time: "21 Agu, 19:10", title: "Dijemput kurir", desc: "SiCepat Gokil" },
      { time: "21 Agu, 16:40", title: "Pesanan dikonfirmasi" },
    ],
  },
  {
    id: "ORD-8710",
    items: [{ name: "Apple Watch Series 10", qty: 1, price: 2499000 }],
    orderStatus: "completed",
    shipmentStatus: "delivered",
    total: 2517000,
    shippingFee: 18000,
    courier: "AnterAja",
    trackingNumber: "AA5566778899",
    address: "Jl. Melawai Raya No. 12, Kebayoran Baru, Jakarta Selatan",
    recipient: "Andi Pratama",
    placedAt: "18 Agu 2026, 11:05",
    updatedAt: "20 Agu 2026, 18:40",
    lat: -6.2431,
    lng: 106.7995,
    history: [
      { time: "20 Agu, 18:40", title: "Paket diterima", desc: "Diterima oleh Andi Pratama" },
      { time: "20 Agu, 14:20", title: "Kurir menuju alamat", desc: "Estimasi 30–60 menit" },
      { time: "19 Agu, 21:05", title: "Dalam perjalanan" },
      { time: "18 Agu, 16:30", title: "Dijemput kurir" },
      { time: "18 Agu, 11:05", title: "Pesanan dikonfirmasi" },
    ],
  },
  {
    id: "ORD-8655",
    items: [{ name: "Anker 7-in-1 Hub", qty: 1, price: 459000 }],
    orderStatus: "cancelled",
    shipmentStatus: "awaiting-pickup",
    total: 459000,
    shippingFee: 0,
    courier: "-",
    trackingNumber: "-",
    address: "Jl. Melawai Raya No. 12, Kebayoran Baru",
    recipient: "Andi Pratama",
    note: "Dibatalkan oleh pembeli",
    placedAt: "17 Agu 2026, 09:22",
    updatedAt: "19 Agu 2026, 11:05",
    lat: -6.2431,
    lng: 106.7995,
    history: [
      { time: "19 Agu, 11:05", title: "Pesanan dibatalkan", desc: "Oleh pembeli" },
      { time: "17 Agu, 09:22", title: "Pesanan dibuat" },
    ],
  },
];

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* ─── Status maps (light) ─── */
const shipmentMeta = {
  "awaiting-pickup": {
    label: "Menunggu Penjemputan",
    sub: "Paket sudah siap di gudang",
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    bar: "bg-violet-500",
    soft: "bg-violet-100",
  },
  transit: {
    label: "Dalam Perjalanan",
    sub: "Sedang dikirim ke alamatmu",
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    bar: "bg-sky-500",
    soft: "bg-sky-100",
  },
  delivered: {
    label: "Sudah Diterima",
    sub: "Paket berhasil sampai",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
    soft: "bg-emerald-100",
  },
} as const;

const orderMeta = {
  pending: { label: "Menunggu", cls: "text-amber-700 bg-amber-50 ring-amber-200" },
  processing: { label: "Diproses", cls: "text-sky-700 bg-sky-50 ring-sky-200" },
  cancelled: { label: "Dibatalkan", cls: "text-rose-700 bg-rose-50 ring-rose-200" },
  completed: { label: "Selesai", cls: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
} as const;

/* ─── Icons ─── */
function IconRocket({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 4-3 4-3" strokeLinecap="round" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-4 3-4" strokeLinecap="round" />
    </svg>
  );
}

function IconTruck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function IconCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className={className}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPackage({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

function IconCopy({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconPhone({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/* ─── Leaflet Map ─── */
const OrderMap = dynamic(
  () =>
    import("react-leaflet").then(({ MapContainer, TileLayer, Marker, Popup }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require("leaflet");
      // @ts-expect-error leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      return function Map({ lat, lng, label }: { lat: number; lng: number; label: string }) {
        return (
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            className="rounded-xl z-0"
            style={{ height: 176, width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>{label}</Popup>
            </Marker>
          </MapContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[176px] w-full items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-400">
        Memuat peta…
      </div>
    ),
  }
);

/* ─── Animated status ─── */
function StatusVisual({ status }: { status: ShipmentStatus }) {
  const meta = shipmentMeta[status];

  if (status === "awaiting-pickup") {
    return (
      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg} ring-1 ${meta.ring}`}>
        <div className="absolute inset-0 animate-ping rounded-xl bg-violet-400/20" />
        <IconRocket className={`relative z-10 h-5 w-5 ${meta.color} animate-[float_2.4s_ease-in-out_infinite]`} />
      </div>
    );
  }

  if (status === "transit") {
    return (
      <div className={`relative flex h-12 w-16 shrink-0 items-center overflow-hidden rounded-xl ${meta.bg} ring-1 ${meta.ring}`}>
        <div className="absolute bottom-1.5 left-1.5 right-1.5 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
        <div className="animate-[drive_2.8s_ease-in-out_infinite]">
          <IconTruck className={`ml-1.5 h-5 w-5 ${meta.color}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg} ring-1 ${meta.ring}`}>
      <div className="absolute inset-0 animate-[ping_1.8s_ease-out_infinite] rounded-xl bg-emerald-400/20" />
      <IconCheck className={`relative z-10 h-5 w-5 ${meta.color}`} />
    </div>
  );
}

/* ─── Timeline steps ─── */
function Timeline({ status, cancelled }: { status: ShipmentStatus; cancelled?: boolean }) {
  const steps: { key: ShipmentStatus; label: string; icon: React.ReactNode }[] = [
    { key: "awaiting-pickup", label: "Pickup", icon: <IconRocket className="h-3.5 w-3.5" /> },
    { key: "transit", label: "Transit", icon: <IconTruck className="h-3.5 w-3.5" /> },
    { key: "delivered", label: "Selesai", icon: <IconCheck className="h-3.5 w-3.5" /> },
  ];
  const current = steps.findIndex((s) => s.key === status);

  if (cancelled) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
        Pesanan dibatalkan — tidak ada pengiriman aktif.
      </div>
    );
  }

  return (
    <div>
      {steps.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  done ? `${shipmentMeta[step.key].bar} text-white shadow-sm` : "bg-zinc-100 text-zinc-400"
                } ${active ? "scale-110 ring-4 ring-zinc-100" : ""}`}
              >
                {step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px min-h-[18px] flex-1 ${done && i < current ? "bg-zinc-300" : "bg-zinc-100"}`} />
              )}
            </div>
            <div className={`pb-3.5 ${i === steps.length - 1 ? "pb-0" : ""}`}>
              <p className={`text-sm font-medium ${done ? "text-zinc-800" : "text-zinc-400"}`}>{step.label}</p>
              {active && <p className="mt-0.5 text-xs text-zinc-500">{shipmentMeta[status].sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Copy helper ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-200"
    >
      <IconCopy />
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

/* ─── Order Card ─── */
function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ord = orderMeta[order.orderStatus];
  const cancelled = order.orderStatus === "cancelled";
  const ship = shipmentMeta[order.shipmentStatus];

  return (
    <article
      className={`rounded-2xl border bg-white transition-all duration-300 ${
        expanded
          ? "border-zinc-200 shadow-md shadow-zinc-200/60"
          : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      {/* header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3.5 p-4 text-left sm:p-5"
      >
        <StatusVisual status={order.shipmentStatus} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-medium text-zinc-500">{order.id}</span>
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ord.cls}`}>
              {ord.label}
            </span>
            {!cancelled && (
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${ship.bg} ${ship.color}`}>
                {ship.label}
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-[15px] font-semibold text-zinc-900">
            {order.items.map((i) => i.name).join(" · ")}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
            <span>{order.courier}</span>
            <span className="font-mono text-zinc-400">{order.trackingNumber}</span>
            {order.estimatedDelivery && !cancelled && <span>Est. {order.estimatedDelivery}</span>}
          </div>

          {/* mini activity preview (collapsed) */}
          {!expanded && order.history[0] && (
            <p className="mt-2 line-clamp-1 text-[12px] text-zinc-400">
              <span className="font-medium text-zinc-500">{order.history[0].title}</span>
              {order.history[0].desc ? ` · ${order.history[0].desc}` : ""}
              <span className="ml-1.5 text-zinc-300">· {order.history[0].time}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-sm font-semibold tabular-nums text-zinc-900">{formatIDR(order.total)}</p>
          <p className="text-[11px] text-zinc-400">{order.updatedAt}</p>
          <div className={`mt-0.5 text-zinc-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>

      {/* expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-5 pt-4 sm:px-5">
          {/* quick actions bar */}
          {!cancelled && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <CopyButton text={order.trackingNumber} />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-200"
              >
                <IconPhone />
                Hubungi kurir
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-200"
              >
                Lihat invoice
              </button>
              <span className="ml-auto text-[11px] text-zinc-400">
                Resi: <span className="font-mono text-zinc-600">{order.trackingNumber}</span>
              </span>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {/* LEFT */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Progress
                </p>
                <Timeline status={order.shipmentStatus} cancelled={cancelled} />
              </div>

              {/* tracking history — biar rame */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Riwayat Tracking
                </p>
                <div className="max-h-44 space-y-0 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {order.history.map((ev, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 px-3 py-2.5 ${i !== order.history.length - 1 ? "border-b border-zinc-100" : ""}`}
                    >
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13px] font-medium text-zinc-800">{ev.title}</p>
                          <span className="shrink-0 text-[11px] text-zinc-400">{ev.time}</span>
                        </div>
                        {ev.desc && <p className="mt-0.5 text-xs text-zinc-500">{ev.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!cancelled && (
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="w-full">
                    <OrderMap lat={order.lat} lng={order.lng} label={order.recipient} />
                  </div>
                  <div className="flex items-start gap-2 border-t border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800">{order.recipient}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 break-words">
                        {order.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Item ({order.items.length})
                </p>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
                          <IconPackage className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800">{item.name}</p>
                          <p className="text-xs text-zinc-400">Qty {item.qty}</p>
                        </div>
                      </div>
                      <span className="shrink-0 tabular-nums text-zinc-600">
                        {formatIDR(item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatIDR(order.total - order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ongkir ({order.courier})</span>
                  <span className="tabular-nums">
                    {order.shippingFee === 0 ? "Gratis" : formatIDR(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                  <span>Total</span>
                  <span className="tabular-nums">{formatIDR(order.total)}</span>
                </div>
              </div>

              {order.note && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                  <span className="font-medium">Catatan: </span>
                  {order.note}
                </div>
              )}

              {/* info grid biar lebih padat */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <p className="text-zinc-400">Dipesan</p>
                  <p className="mt-0.5 font-medium text-zinc-700">{order.placedAt}</p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <p className="text-zinc-400">Update terakhir</p>
                  <p className="mt-0.5 font-medium text-zinc-700">{order.updatedAt}</p>
                </div>
                {!cancelled && order.estimatedDelivery && (
                  <div className="col-span-2 rounded-lg border border-zinc-100 bg-white px-3 py-2">
                    <p className="text-zinc-400">Estimasi tiba</p>
                    <p className="mt-0.5 font-medium text-zinc-700">{order.estimatedDelivery}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* ─── Page ─── */
export default function OrdersPage() {
  const [openId, setOpenId] = useState<string | null>(ORDERS[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | ShipmentStatus | "cancelled">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered = ORDERS.filter((o) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return o.orderStatus === "cancelled";
    return o.shipmentStatus === filter && o.orderStatus !== "cancelled";
  });

  const counts = {
    all: ORDERS.length,
    "awaiting-pickup": ORDERS.filter(
      (o) => o.shipmentStatus === "awaiting-pickup" && o.orderStatus !== "cancelled"
    ).length,
    transit: ORDERS.filter((o) => o.shipmentStatus === "transit").length,
    delivered: ORDERS.filter((o) => o.shipmentStatus === "delivered").length,
    cancelled: ORDERS.filter((o) => o.orderStatus === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes drive {
          0% { transform: translateX(-6px); }
          50% { transform: translateX(22px); }
          100% { transform: translateX(-6px); }
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]">
            Pesanan
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Lacak status dan detail pengirimanmu.
          </p>
        </header>

        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["all", "Semua"],
              ["awaiting-pickup", "Pickup"],
              ["transit", "Transit"],
              ["delivered", "Selesai"],
              ["cancelled", "Batal"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:text-zinc-800"
              }`}
            >
              {label}
              <span className="ml-1.5 tabular-nums opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {!mounted ? (
            <div className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-100" />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-14 text-center text-sm text-zinc-400">
              Tidak ada pesanan di kategori ini.
            </div>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={openId === order.id}
                onToggle={() => setOpenId((prev) => (prev === order.id ? null : order.id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}