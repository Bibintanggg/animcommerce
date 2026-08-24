"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";

import type {
    Notification,
} from "@/types/notification";

export default function AdminNotificationListener() {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        const apiURL =
            process.env.NEXT_PUBLIC_API_URL;

        if (!apiURL) {
            console.error(
                "NEXT_PUBLIC_API_URL belum dikonfigurasi",
            );

            return;
        }

        const eventSource = new EventSource(
            `${apiURL}/admin/notifications/stream`,
            {
                withCredentials: true,
            },
        );

        const handleOrderCreated = (
            event: MessageEvent<string>,
        ) => {
            try {
                const notification =
                    JSON.parse(event.data) as Notification;

                gooeyToast.success(notification.title, {
                    description: notification.message,

                    action: notification.order_id
                        ? {
                            label: "Lihat order",
                            successLabel: "Membuka...",
                            onClick: () => {
                                router.push(
                                    `/admin/orders/${notification.order_id}`,
                                );
                            },
                        }
                        : undefined,

                    timing: {
                        displayDuration: 8000,
                    },

                    showProgress: true,
                    preset: "smooth",
                });

                queryClient.invalidateQueries({
                    queryKey: ["orders"],
                });

                queryClient.invalidateQueries({
                    queryKey: ["notifications"],
                });
            } catch (error) {
                console.error(
                    "Gagal membaca event notifikasi:",
                    error,
                );

                gooeyToast.error(
                    "Notifikasi tidak dapat ditampilkan",
                    {
                        description:
                            "Data notifikasi dari server tidak valid.",
                    },
                );
            }
        };

        eventSource.addEventListener(
            "order.created",
            handleOrderCreated as EventListener,
        );

        eventSource.onopen = () => {
            console.log(
                "Koneksi notifikasi berhasil terhubung",
            );
        };

        eventSource.onerror = () => {
            // Tidak perlu menampilkan toast setiap reconnect,
            // karena bisa mengganggu admin.
            console.warn(
                "Koneksi notifikasi terputus. Mencoba menghubungkan ulang...",
            );
        };

        return () => {
            eventSource.removeEventListener(
                "order.created",
                handleOrderCreated as EventListener,
            );

            eventSource.close();
        };
    }, [queryClient, router]);

    return null;
}