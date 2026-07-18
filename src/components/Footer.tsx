"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer id="office" className="bg-[#0d2b5e] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 grid gap-8 sm:grid-cols-3">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/20 bg-white shrink-0">
              <img src="/og-kjri.png" alt={t("brandName")} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-sm">{t("brandName")}</div>
              <div className="text-[10px] text-blue-200">
                {t("brandSubtitle")}
              </div>
            </div>
          </div>

          <p className="text-sm text-blue-200 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Office */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-4">
            {t("officeHoursTitle")}
          </div>

          <div className="text-sm text-blue-100 mb-3">
            {t("address")}
          </div>

          <div className="space-y-1 mb-4 text-sm text-blue-200">
            <div>{t("hoursWeekday")}</div>
            <div>{t("hoursFriday")}</div>
          </div>

          <div className="text-sm font-semibold text-red-400">
            {t("hotline")}
          </div>
        </div>

        {/* Contact + Pengaduan */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-4">
            {t("contactTitle")}
          </div>

          <div className="space-y-2 text-sm text-blue-200 mb-5">
            <div>{t("phone")}</div>
            <div>{t("emailConsular")}</div>
            <div>{t("emailPassport")}</div>
          </div>

          {/* Pengaduan Layanan */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-amber-400 text-sm">📣</span>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {t("complaintsTitle")}
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="https://www.lapor.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group"
              >
                <div className="h-7 w-7 rounded-md bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition">
                  <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-amber-300 group-hover:text-amber-200 transition leading-snug">
                    {t("sp4nTitle")}
                  </div>
                  <div className="text-[10px] text-white/30 group-hover:text-white/50 transition">
                    {t("sp4nUrl")}
                  </div>
                </div>
                <svg className="h-3 w-3 text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="mailto:whistleblowing@indonesiavancouver.org"
                className="flex items-center gap-2.5 group"
              >
                <div className="h-7 w-7 rounded-md bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition">
                  <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-amber-300 group-hover:text-amber-200 transition leading-snug">
                    {t("whistleblowingTitle")}
                  </div>
                  <div className="text-[10px] text-white/30 group-hover:text-white/50 transition truncate">
                    {t("whistleblowingEmail")}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between">
          <div className="text-xs text-blue-300">
            {t("copyright")}
          </div>

          <a
            href="https://kemlu.go.id/vancouver"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-300 hover:text-white transition"
          >
            {t("kemluLink")}
          </a>
        </div>
      </div>
    </footer>
  );
}
