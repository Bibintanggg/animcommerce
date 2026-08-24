import api from "@/lib/api";
import { getBrowserMessaging } from "@/lib/firebase";

import {
    onRegistered,
    register,
} from "firebase/messaging";

export async function registerFCMDevice():
    Promise<string> {
    if (!("Notification" in window)) {
        throw new Error(
            "Browser tidak mendukung notification",
        );
    }

    let permission = Notification.permission;

    if (permission === "default") {
        permission =
            await Notification.requestPermission();
    }

    if (permission !== "granted") {
        throw new Error(
            "Izin notifikasi belum diberikan",
        );
    }

    const messaging =
        await getBrowserMessaging();

    if (!messaging) {
        throw new Error(
            "Firebase Messaging tidak didukung browser ini",
        );
    }

    const vapidKey =
        process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
        throw new Error(
            "Firebase VAPID key belum dikonfigurasi",
        );
    }

    return new Promise<string>(
        (resolve, reject) => {
            let unsubscribe = () => { };

            const timeout = window.setTimeout(() => {
                unsubscribe();

                reject(
                    new Error(
                        "Registrasi Firebase melebihi batas waktu",
                    ),
                );
            }, 15000);

            unsubscribe = onRegistered(
                messaging,
                async (installationID) => {
                    try {
                        await api.post(
                            "/admin/notifications/devices",
                            {
                                installation_id:
                                    installationID,

                                user_agent:
                                    navigator.userAgent,
                            },
                        );

                        window.clearTimeout(timeout);
                        unsubscribe();
                        resolve(installationID);
                    } catch (error) {
                        window.clearTimeout(timeout);
                        unsubscribe();
                        reject(error);
                    }
                },
            );

            register(messaging, {
                vapidKey,
            }).catch((error) => {
                window.clearTimeout(timeout);
                unsubscribe();
                reject(error);
            });
        },
    );
}