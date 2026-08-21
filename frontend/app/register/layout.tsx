import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Plus_Jakarta_Sans } from "next/font/google";
import ReactQueryProvider from "@/providers/ReactQueryProviders";

export const metadata: Metadata = {
  title: "Animcommerce - Login",
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
    <html lang="en" className={`${plusJakarta.className} font-medium`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReactQueryProvider>
          <main className="pt-16 lg:pt-20">
            <Navbar />
            {children}
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

