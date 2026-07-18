"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d2b5e] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-14">
        <button
          className="inline-flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 transition cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={tCommon("toggleMenu")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
          <span className="text-sm font-semibold">{tNav("menu")}</span>
        </button>

        <Link href="/" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 transition cursor-pointer" aria-label={tCommon("home")}>
          <img src="/og-kjri.png" alt={tCommon("logoAlt")} className="h-7 w-7 rounded-full bg-white object-contain" />
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-white/90">{tNav("consulateGeneral")}</div>
            <div className="text-[12px] font-bold tracking-wide">{tNav("kjriVisa")}</div>
          </div>
        </Link>

        <LanguageSwitcher />
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-4">
          <div className="rounded-xl border border-white/10 bg-[#0b244f] shadow-xl overflow-hidden divide-y divide-white/10">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">{tNav("home")}</Link>
            <Link href="/check" onClick={() => setMenuOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">{tNav("checkStatus")}</Link>
            <a href="https://indonesiavancouver.org" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">{tNav("kjriWebsite")}</a>
            <Link href="/apply" onClick={() => setMenuOpen(false)} className="flex items-center px-5 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">{tNav("applyForVisa")}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
