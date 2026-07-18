"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              active
                ? "bg-white text-[#0d2b5e] shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
