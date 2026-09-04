"use client";

import { QRCodeSVG } from "qrcode.react";
import { Copy, X } from "lucide-react";
import { gooeyToast } from "goey-toast";

import { CheckoutResult } from "@/types/checkout";

interface Props {
  order: CheckoutResult | null;
  onClose: () => void;
}

export default function PaymentInstructionModal({ order, onClose }: Props) {
  if (!order) return null;

  const payment = order.payment;

  const copyVA = async () => {
    if (!payment.va_number) return;

    await navigator.clipboard.writeText(payment.va_number);

    gooeyToast.success("Nomor VA berhasil disalin");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold">Selesaikan pembayaran</h2>

        <p className="mt-1 text-sm text-gray-500">
          Pesanan {order.order_number}
        </p>

        {payment.method === "qris" && payment.qr_string && (
          <div className="mt-6 text-center">
            <div className="mx-auto inline-flex min-h-[252px] min-w-[252px] items-center justify-center rounded-2xl border bg-white p-4">
              {payment.qr_url ? (
                <img
                  src={payment.qr_url}
                  alt={`QRIS pesanan ${order.order_number}`}
                  width={220}
                  height={220}
                  className="h-[220px] w-[220px]"
                />
              ) : payment.qr_string ? (
                <div className="mx-auto inline-block rounded-2xl border bg-white p-4">
                  <QRCodeSVG value={payment.qr_string} size={220} level="M" />
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  QRIS tidak tersedia. Silakan hubungi admin untuk bantuan
                </p>
              )}
            </div>

            <p className="mt-4 text-sm font-medium">Scan QRIS untuk membayar</p>

            <p className="mt-1 text-xs text-gray-500">
              Selesaikan pembayaran sebelum waktu pembayaran berakhir.
            </p>
          </div>
        )}

        {payment.method === "bca_va" && payment.va_number && (
          <div className="mt-6 rounded-2xl border bg-gray-50 p-5">
            <p className="text-xs text-gray-500">Nomor BCA Virtual Account</p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-semibold">
                {payment.va_number}
              </p>

              <button
                type="button"
                onClick={copyVA}
                className="rounded-xl border bg-white p-2"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-amber-700">
              Nomor ini hanya dummy untuk pengembangan.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
          <span>Status pembayaran</span>
          <span className="font-medium text-amber-700">
            Menunggu pembayaran
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl bg-black text-sm font-medium text-white"
        >
          Lihat pesanan saya
        </button>
      </div>
    </div>
  );
}
