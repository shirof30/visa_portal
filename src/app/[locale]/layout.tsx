import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/og-kjri.png", shortcut: "/og-kjri.png" },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen text-gray-900 overflow-x-hidden flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <div className="fixed inset-0 -z-20 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat" />
          <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50/60 via-stone-50/80 to-white/85 backdrop-blur-[1px]" />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </NextIntlClientProvider>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
