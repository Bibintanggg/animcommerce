"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useMutation } from "@tanstack/react-query";
import {
    BellRing,
    Loader2,
    X,
} from "lucide-react";

import { gooeyToast } from "goey-toast";
import { registerFCMDevice } from "@/services/fcm.service";

const REMINDER_KEY =
    "admin-notification-reminder-shown";

export default function EnablePushNotification() {
    const [isOpen, setIsOpen] = useState(false);

    const automaticAttempted = useRef(false);
    const isManualRegistration = useRef(false);

    const registerMutation = useMutation({
        mutationFn: registerFCMDevice,

        onSuccess: () => {
            setIsOpen(false);

            if (isManualRegistration.current) {
                gooeyToast.success(
                    "Notifikasi berhasil diaktifkan",
                    {
                        description:
                            "Pesanan baru akan muncul sebagai notifikasi perangkat.",

                        showProgress: true,
                        preset: "smooth",
                    }
                );
            }

            isManualRegistration.current = false;
        },

        onError: (error) => {
            if (isManualRegistration.current) {
                gooeyToast.error(
                    "Gagal mengaktifkan notifikasi",
                    {
                        description:
                            error instanceof Error
                                ? error.message
                                : "Terjadi kesalahan",
                    }
                );
            } else {
                console.error(
                    "Registrasi FCM otomatis gagal:",
                    error
                );
            }

            isManualRegistration.current = false;

            // Kalau sudah diblokir, browser tidak bisa meminta izin ulang.
            if (
                "Notification" in window &&
                Notification.permission === "denied"
            ) {
                setIsOpen(false);
            }
        },
    });

    const {
        mutate,
        isPending,
    } = registerMutation;

    useEffect(() => {
        if (!("Notification" in window)) {
            return;
        }

        const permission =
            Notification.permission;

        /*
         * Jika izin sebelumnya sudah diberikan,
         * langsung registrasikan perangkat tanpa modal.
         */
        if (
            permission === "granted" &&
            !automaticAttempted.current
        ) {
            automaticAttempted.current = true;
            mutate();
            return;
        }

        /*
         * Jangan tampilkan modal jika notifikasi
         * sudah diblokir dari pengaturan browser.
         */
        if (permission === "denied") {
            return;
        }

        /*
         * Tampilkan hanya sekali dalam satu sesi login/tab.
         */
        const reminderWasShown =
            sessionStorage.getItem(REMINDER_KEY);

        if (!reminderWasShown) {
            sessionStorage.setItem(
                REMINDER_KEY,
                "true"
            );

            setIsOpen(true);
        }
    }, [mutate]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.body.style.overflow = "";

            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [isOpen]);

    const handleEnable = () => {
        isManualRegistration.current = true;
        mutate();
    };

    const handleLater = () => {
        setIsOpen(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Tutup pengingat"
                onClick={handleLater}
                className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
                <button
                    type="button"
                    aria-label="Tutup"
                    onClick={handleLater}
                    className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#BC002D]">
                    <BellRing className="h-7 w-7" />
                </div>

                <h2
                    id="notification-modal-title"
                    className="pr-8 text-xl font-semibold text-gray-950"
                >
                    Aktifkan notifikasi pesanan
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                    Dapatkan pemberitahuan ketika ada
                    pesanan baru, bahkan saat dashboard
                    sedang diminimalkan.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={handleEnable}
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#BC002D] px-5 text-sm font-medium text-white transition hover:bg-[#9f0026] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mengaktifkan...
                            </>
                        ) : (
                            <>
                                <BellRing className="h-4 w-4" />
                                Aktifkan
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={isPending}
                        onClick={handleLater}
                        className="h-12 flex-1 rounded-2xl border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                    >
                        Nanti saja
                    </button>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    Izin dapat diubah kembali melalui
                    pengaturan browser.
                </p>
            </div>
        </div>
    );
}