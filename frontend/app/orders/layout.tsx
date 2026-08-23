import type { Metadata } from "next";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Plus_Jakarta_Sans } from "next/font/google";
import ReactQueryProvider from "@/providers/ReactQueryProviders";

export const metadata: Metadata = {
    title: "Animcommerce",
    description: "Curated figures, manga, and collectibles sourced directly from Japan's most celebrated studios.",
};

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="pt-16 lg:pt-20">
                {children}
            </main>
            <Footer />
        </>
    );
}

