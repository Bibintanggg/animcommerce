"use client";

import { useMutation } from "@tanstack/react-query";
import { BellRing, Loader2 } from "lucide-react";
import { gooeyToast } from "goey-toast";

import {
    registerFCMDevice,
} from "@/services/fcm.service";

export default function EnablePushNotification() {
    const registerMutation = useMutation({
        mutationFn: registerFCMDevice,

        onSuccess: () => {
            gooeyToast.success(
                "Notifikasi berhasil diaktifkan",
                {
                    description:
                        "Pesanan baru akan muncul sebagai notifikasi browser.",

                    showProgress: true,
                    preset: "smooth",
                },
            );
        },

        onError: (error) => {
            gooeyToast.error(
                "Gagal mengaktifkan notifikasi",
                {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Terjadi kesalahan",
                },
            );
        },
    });

    return (
        <button
            type="button"
            disabled={registerMutation.isPending}
            onClick={() => registerMutation.mutate()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-50"
        >
            {registerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <BellRing className="h-4 w-4" />
            )}

            Aktifkan notifikasi
        </button>
    );
}