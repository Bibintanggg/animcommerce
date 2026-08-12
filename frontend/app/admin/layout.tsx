import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Plus_Jakarta_Sans } from "next/font/google";
import ReactQueryProvider from "@/providers/ReactQueryProviders";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
    title: "NIHON — Premium Japanese Anime Merchandise",
    description: "Curated figures, manga, and collectibles sourced directly from Japan's most celebrated studios.",
};

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700"],
});

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${plusJakarta.variable} font-medium`}>
            <SidebarProvider>
                <AppSidebar />

                <main className="flex-1 min-w-0 p-6">
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
}
