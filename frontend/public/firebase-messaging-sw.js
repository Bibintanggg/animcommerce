/*
 * Samakan versi ini dengan versi Firebase milikmu.
 * Jalankan: npm list firebase
 */
const FIREBASE_VERSION = "12.18.0";

importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
);

importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`,
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
firebase.messaging();