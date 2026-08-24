const FIREBASE_VERSION = "12.18.0";

/*
 * Pasang listener click sebelum mengimpor Firebase,
 * supaya tidak ditimpa oleh handler bawaan FCM.
 */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const path =
        event.notification.data?.url ??
        "/admin/orders";

    const destination = new URL(
        path,
        self.location.origin
    ).href;

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then(async (windowClients) => {
                for (const client of windowClients) {
                    if ("focus" in client) {
                        await client.navigate(destination);
                        return client.focus();
                    }
                }

                return clients.openWindow(destination);
            })
    );
});

importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`
);

importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`
);

const firebaseConfig = {
    apiKey: "AIzaSyAZ2kOPqznzBa5W5HmqilHV2lZkaf85u7M",
    authDomain: "ecommerce-9e7a2.firebaseapp.com",
    projectId: "ecommerce-9e7a2",
    storageBucket: "ecommerce-9e7a2.firebasestorage.app",
    messagingSenderId: "206471013297",
    appId: "1:206471013297:web:bec0b905bd7721ba941390",
    measurementId: "G-WLK1STDD8H"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Background message:",
        payload
    );

    const title =
        payload.data?.title ??
        "Pesanan baru masuk";

    const options = {
        body:
            payload.data?.body ??
            "Ada pesanan baru yang perlu diproses.",

        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",

        tag:
            payload.data?.order_id
                ? `order-${payload.data.order_id}`
                : "new-order",

        renotify: true,

        data: {
            url:
                payload.data?.url ??
                "/admin/orders",
        },
    };

    return self.registration.showNotification(
        title,
        options
    );
});