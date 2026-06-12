import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VISA - KJRI Vancouver",
  description: "Indonesian Visa Application Portal — Consulate General of Indonesia in Vancouver",
  icons: { icon: "/og-kjri.png", shortcut: "/og-kjri.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900 overflow-x-hidden flex flex-col">
        <div className="fixed inset-0 -z-20 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50/60 via-stone-50/80 to-white/85 backdrop-blur-[1px]" />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
