"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getOrderUser, downloadOrderInvoice } from "@/services/order.service";
import { OrderProduct } from "@/types/order";
import { StatusOrder } from "@/enums/order-status";
import { ShipmentStatus } from "@/enums/shipment-status";
import { toast } from "sonner";

/* ─── helpers ─── */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDateTime = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShort = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** UI visual bucket dari status_shipment backend */
type ShipmentVisual = "awaiting-pickup" | "transit" | "delivered";

function toShipmentVisual(status?: ShipmentStatus | string | null): ShipmentVisual {
  const s = String(status ?? "").toLowerCase().replace(/[\s-]+/g, "_");

  if (
    ["delivered", "completed", "selesai", "diterima"].some((k) => s.includes(k))
  ) {
    return "delivered";
  }
  if (
    ["transit", "shipped", "on_delivery", "on_the_way", "dikirim", "sending"].some(
      (k) => s.includes(k)
    )
  ) {
    return "transit";
  }
  return "awaiting-pickup";
}

function buildHistory(order: OrderProduct) {
  const events: { time: string; title: string; desc?: string }[] = [];

  if (order.status_order === "cancelled") {
    events.push({
      time: formatShort(order.updated_at),
      title: "Pesanan dibatalkan",
    });
  }

  if (order.completed_at) {
    events.push({
      time: formatShort(order.completed_at),
      title: "Paket diterima",
      desc: "Pesanan selesai",
    });
  }

  if (order.shipped_at) {
    events.push({
      time: formatShort(order.shipped_at),
      title: "Paket dikirim",
      desc: order.courier ? `Kurir ${order.courier}` : undefined,
    });
  }

  if (order.tracking_number) {
    events.push({
      time: formatShort(order.updated_at),
      title: "Resi tersedia",
      desc: order.tracking_number,
    });
  }

  events.push({
    time: formatShort(order.created_at),
    title: "Pesanan dibuat",
    desc:
      order.payment?.payment_status === "success"
        ? "Pembayaran berhasil"
        : order.payment?.payment_status === "pending"
          ? "Menunggu pembayaran"
          : undefined,
  });

  return events;
}

const shipmentMeta = {
  "awaiting-pickup": {
    label: "Menunggu Penjemputan",
    sub: "Paket sudah siap di gudang",
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    bar: "bg-violet-500",
  },
  transit: {
    label: "Dalam Perjalanan",
    sub: "Sedang dikirim ke alamatmu",
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    bar: "bg-sky-500",
  },
  delivered: {
    label: "Sudah Diterima",
    sub: "Paket berhasil sampai",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
  },
} as const;

const orderMeta: Record<
  StatusOrder | string,
  { label: string; cls: string }
> = {
  pending: {
    label: "Menunggu",
    cls: "text-amber-700 bg-amber-50 ring-amber-200",
  },
  processing: {
    label: "Diproses",
    cls: "text-sky-700 bg-sky-50 ring-sky-200",
  },
  cancelled: {
    label: "Dibatalkan",
    cls: "text-rose-700 bg-rose-50 ring-rose-200",
  },
  completed: {
    label: "Selesai",
    cls: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  },
};

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

/* ─── Map ─── */
const OrderMap = dynamic(
  () =>
    import("react-leaflet").then(({ MapContainer, TileLayer, Marker, Popup }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      return function Map({
        lat,
        lng,
        label,
      }: {
        lat: number;
        lng: number;
        label: string;
      }) {
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

function StatusVisual({ status }: { status: ShipmentVisual }) {
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

function Timeline({
  status,
  cancelled,
}: {
  status: ShipmentVisual;
  cancelled?: boolean;
}) {
  const steps: { key: ShipmentVisual; label: string; icon: React.ReactNode }[] = [
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
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${done
                  ? `${shipmentMeta[step.key].bar} text-white shadow-sm`
                  : "bg-zinc-100 text-zinc-400"
                  } ${active ? "scale-110 ring-4 ring-zinc-100" : ""}`}
              >
                {step.icon}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-px min-h-[18px] flex-1 ${done && i < current ? "bg-zinc-300" : "bg-zinc-100"
                    }`}
                />
              )}
            </div>
            <div className={`pb-3.5 ${i === steps.length - 1 ? "pb-0" : ""}`}>
              <p className={`text-sm font-medium ${done ? "text-zinc-800" : "text-zinc-400"}`}>
                {step.label}
              </p>
              {active && (
                <p className="mt-0.5 text-xs text-zinc-500">{shipmentMeta[status].sub}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;

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

/* ─── Card (pakai OrderProduct) ─── */
function OrderCard({
  order,
  expanded,
  onToggle,
  onDownloadInvoice,
  downloading,
}: {
  order: OrderProduct;
  expanded: boolean;
  onToggle: () => void;
  onDownloadInvoice: (order: OrderProduct) => void;
  downloading: boolean;
}) {
  const shipVisual = toShipmentVisual(order.status_shipment);
  const ord = orderMeta[order.status_order] ?? {
    label: String(order.status_order),
    cls: "text-zinc-700 bg-zinc-50 ring-zinc-200",
  };
  const cancelled = order.status_order === "cancelled";
  const ship = shipmentMeta[shipVisual];
  const history = buildHistory(order);

  const shippingFee = Number(order.shipping_cost ?? 0);
  const subtotal = Number(order.total_price ?? 0);
  const total = subtotal + shippingFee;

  const recipient =
    order.user_address?.receiver_name ?? order.user?.name ?? "—";
  const address = [
    order.user_address?.address_line,
    order.user_address?.city,
    order.user_address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ") || "Alamat belum tersedia";

  const itemNames = (order.items ?? [])
    .map((i) => i.product?.title ?? `Produk #${i.product_id}`)
    .join(" · ");

  // Map belum ada koordinat di backend → fallback Jakarta
  const lat = -6.2431;
  const lng = 106.7995;

  return (
    <article
      className={`rounded-2xl border bg-white transition-all duration-300 ${expanded
        ? "border-zinc-200 shadow-md shadow-zinc-200/60"
        : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm"
        }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3.5 p-4 text-left sm:p-5"
      >
        <StatusVisual status={shipVisual} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-medium text-zinc-500">
              {order.order_number}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ord.cls}`}
            >
              {ord.label}
            </span>
            {!cancelled && (
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${ship.bg} ${ship.color}`}
              >
                {ship.label}
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-[15px] font-semibold text-zinc-900">
            {itemNames || "Produk"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
            <span>{order.courier ?? "—"}</span>
            {order.tracking_number && (
              <span className="font-mono text-zinc-400">
                {order.tracking_number}
              </span>
            )}
          </div>

          {!expanded && history[0] && (
            <p className="mt-2 line-clamp-1 text-[12px] text-zinc-400">
              <span className="font-medium text-zinc-500">{history[0].title}</span>
              {history[0].desc ? ` · ${history[0].desc}` : ""}
              <span className="ml-1.5 text-zinc-300">· {history[0].time}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-sm font-semibold tabular-nums text-zinc-900">
            {formatIDR(total)}
          </p>
          <p className="text-[11px] text-zinc-400">
            {formatDateTime(order.updated_at)}
          </p>
          <div
            className={`mt-0.5 text-zinc-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""
              }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-5 pt-4 sm:px-5">
          {!cancelled && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {order.tracking_number && (
                <CopyButton text={order.tracking_number} />
              )}
              {order.tracking_number && (
                <span className="ml-auto text-[11px] text-zinc-400">
                  Resi:{" "}
                  <span className="font-mono text-zinc-600">
                    {order.tracking_number}
                  </span>
                </span>
              )}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Progress
                </p>
                <Timeline status={shipVisual} cancelled={cancelled} />
              </div>

              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Riwayat Tracking
                </p>
                <div className="max-h-44 space-y-0 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {history.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-zinc-400">
                      Belum ada riwayat
                    </p>
                  ) : (
                    history.map((ev, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 px-3 py-2.5 ${i !== history.length - 1 ? "border-b border-zinc-100" : ""
                          }`}
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-[13px] font-medium text-zinc-800">
                              {ev.title}
                            </p>
                            <span className="shrink-0 text-[11px] text-zinc-400">
                              {ev.time}
                            </span>
                          </div>
                          {ev.desc && (
                            <p className="mt-0.5 text-xs text-zinc-500">{ev.desc}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {!cancelled && (
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <OrderMap lat={lat} lng={lng} label={recipient} />
                  <div className="flex items-start gap-2 border-t border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800">
                        {recipient}
                      </p>
                      {order.user_address?.phone_number && (
                        <p className="text-xs text-zinc-500">
                          {order.user_address.phone_number}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 break-words">
                        {address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Item ({order.items?.length ?? 0})
                </p>
                <ul className="space-y-2">
                  {(order.items ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
                          <IconPackage className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800">
                            {item.product?.title ?? `Produk #${item.product_id}`}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 tabular-nums text-zinc-600">
                        {formatIDR(Number(item.price) * Number(item.quantity))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ongkir ({order.courier ?? "-"})</span>
                  <span className="tabular-nums">
                    {shippingFee === 0 ? "Gratis" : formatIDR(shippingFee)}
                  </span>
                </div>
                {order.payment && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Pembayaran</span>
                    <span className="uppercase text-xs font-medium">
                      {order.payment.payment_method} · {order.payment.payment_status}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                  <span>Total</span>
                  <span className="tabular-nums">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <p className="text-zinc-400">Dipesan</p>
                  <p className="mt-0.5 font-medium text-zinc-700">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <p className="text-zinc-400">Update terakhir</p>
                  <p className="mt-0.5 font-medium text-zinc-700">
                    {formatDateTime(order.updated_at)}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[14px] font-medium text-zinc-600 transition hover:bg-zinc-200"
                >
                  <IconPhone />
                  Hubungi kurir
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadInvoice(order);
                  }}
                  disabled={downloading}
                  className=" gap-1.5 rounded-md bg-zinc-100 text-center py-6 text-[14px] font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  {downloading ? "Mengunduh…" : "Lihat invoice"}
                </button>
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
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | ShipmentVisual | "cancelled">("all");
  const [mounted, setMounted] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["user-orders"],
    queryFn: getOrderUser,
    staleTime: 1000 * 60 * 2,
  });

  const orders: OrderProduct[] = data?.data ?? [];

  useEffect(() => {
    if (orders.length && openId === null) {
      setOpenId(orders[0].id);
    }
  }, [orders, openId]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "all") return true;
      if (filter === "cancelled") return o.status_order === "cancelled";
      const visual = toShipmentVisual(o.status_shipment);
      return visual === filter && o.status_order !== "cancelled";
    });
  }, [orders, filter]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      "awaiting-pickup": orders.filter(
        (o) =>
          toShipmentVisual(o.status_shipment) === "awaiting-pickup" &&
          o.status_order !== "cancelled"
      ).length,
      transit: orders.filter(
        (o) =>
          toShipmentVisual(o.status_shipment) === "transit" &&
          o.status_order !== "cancelled"
      ).length,
      delivered: orders.filter(
        (o) => toShipmentVisual(o.status_shipment) === "delivered"
      ).length,
      cancelled: orders.filter((o) => o.status_order === "cancelled").length,
    }),
    [orders]
  );

  const handleDownloadInvoice = async (order: OrderProduct) => {
    try {
      setDownloadingId(order.id);
      const blob = await downloadOrderInvoice(order.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh invoice");
    } finally {
      setDownloadingId(null);
    }
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
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${filter === key
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
          {!mounted || isLoading ? (
            <>
              <div className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-100" />
            </>
          ) : isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 py-10 text-center text-sm text-rose-600">
              Gagal memuat pesanan. Coba refresh halaman.
            </div>
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
                onToggle={() =>
                  setOpenId((prev) => (prev === order.id ? null : order.id))
                }
                onDownloadInvoice={handleDownloadInvoice}
                downloading={downloadingId === order.id}
              />
            ))
          )}
        </div>

        {isFetching && !isLoading && (
          <p className="mt-4 text-center text-xs text-zinc-400 animate-pulse">
            Memperbarui data…
          </p>
        )}
      </div>
    </div>
  );
}