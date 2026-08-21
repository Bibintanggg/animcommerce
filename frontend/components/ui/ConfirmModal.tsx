"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  subtitle,
  confirmText = "Hapus",
  cancelText = "Batal",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        {/* Warning icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.6 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-12 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}

            {isLoading ? "Menghapus..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
