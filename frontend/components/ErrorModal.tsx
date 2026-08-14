"use client";

import { useEffect } from "react";

interface ErrorModalProps {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    buttonText?: string;
    onClose: () => void;
}

export default function ErrorModal({
    isOpen,
    title,
    subtitle,
    buttonText = "Coba Lagi",
    onClose,
}: ErrorModalProps) {
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
                {/* Error Icon with animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-16 h-16">
                        {/* Subtle pulse */}
                        <div className="absolute inset-0 rounded-full bg-red-50 animate-[ping_1.2s_ease-out_1]" />

                        <div className="relative w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-sm animate-[shake_0.4s_ease-in-out]">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {/* Line 1 */}
                                    <path
                                        d="M6 6l12 12"
                                        className="animate-[draw_0.3s_ease-out_forwards]"
                                        style={{
                                            strokeDasharray: 17,
                                            strokeDashoffset: 17,
                                        }}
                                    />
                                    {/* Line 2 */}
                                    <path
                                        d="M6 18L18 6"
                                        className="animate-[draw_0.3s_ease-out_0.1s_forwards]"
                                        style={{
                                            strokeDasharray: 17,
                                            strokeDashoffset: 17,
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
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
      `}</style>
        </div>
    );
}