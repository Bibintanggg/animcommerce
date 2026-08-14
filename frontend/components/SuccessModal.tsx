"use client";

import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  buttonText?: string;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  subtitle,
  buttonText = "Oke",
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl animate-in zoom-in-95 fade-in duration-200">
        {/* Success Icon with animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-green-50 animate-[ping_1.2s_ease-out_1]" />
            
            {/* Main circle */}
            <div className="relative w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    className="animate-[checkmark_0.4s_ease-out_0.15s_forwards]"
                    style={{
                      strokeDasharray: 24,
                      strokeDashoffset: 24,
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-8 h-12 rounded-2xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition active:scale-[0.98]"
        >
          {buttonText}
        </button>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes checkmark {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}