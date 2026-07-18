"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const VISA_CATEGORY_CODES = ["C1", "C2", "C3", "C4", "C5"] as const;
type VisaCategoryCode = (typeof VISA_CATEGORY_CODES)[number];

const HOW_TO_APPLY_STEPS = [
  { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
  { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
  { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
] as const;

const SERVICE_HOUR_SLOTS = [
  { dayKey: "monThu" as const, t1: "09:30 – 11:30", t2: "13:00 – 16:30" },
  { dayKey: "friday" as const, t1: "09:30 – 11:30", t2: "14:30 – 17:00" },
];

function RequirementsModal({
  categoryCode,
  onClose,
}: {
  categoryCode: VisaCategoryCode | null;
  onClose: () => void;
}) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  if (!categoryCode) return null;

  const isTourism = categoryCode === "C1";
  const items = t.raw(`categories.${categoryCode}.items`) as string[];
  const mandatory = t.raw("requirementsModal.mandatory") as string[];
  const additional = t.raw("requirementsModal.additional") as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-[#E8E9ED]">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded bg-[#111318] text-white text-xs font-bold px-2 py-0.5 mb-2">
              {categoryCode}
            </span>
            <h3 className="text-lg font-bold text-[#111318]">{t(`categories.${categoryCode}.title`)}</h3>
            <p className="text-xs text-[#8C909D] mt-0.5">
              {t(`categories.${categoryCode}.itemsId`)} — {items.join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={tCommon("close")}
            className="shrink-0 h-8 w-8 rounded-lg border border-[#E8E9ED] text-[#8C909D] hover:text-[#111318] hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-[#4B5060] leading-relaxed">
            {t("requirementsModal.visaDescription")}
          </p>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C909D] mb-2">
              {t("requirementsModal.mandatoryTitle")}
            </p>
            <ul className="space-y-2">
              {mandatory.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-[#4B5060]">
                  <svg className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C909D] mb-2">
              {t("requirementsModal.additionalTitle")}
            </p>
            <ul className="space-y-2">
              {additional.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-[#4B5060]">
                  <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-gray-50 border border-[#E8E9ED] p-4 text-sm text-[#4B5060]">
            <p>
              <strong className="text-[#111318]">{t("requirementsModal.feeLabel")}</strong>{" "}
              {isTourism ? t("requirementsModal.feeTourism") : t("requirementsModal.feeNonTourism")}
              {t("requirementsModal.feePayment")}
            </p>
            <p className="mt-2">
              <strong className="text-[#111318]">{t("requirementsModal.processingLabel")}</strong>{" "}
              {t("requirementsModal.processingTime")}
            </p>
          </div>

          <p className="text-xs text-[#8C909D] leading-relaxed">
            {t("requirementsModal.submitNote")}
          </p>
        </div>

        <div className="px-6 pb-6">
          <Link
            href="/apply"
            className="block w-full text-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            {t("requirementsModal.startApplication")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const [activeCategory, setActiveCategory] = useState<VisaCategoryCode | null>(null);

  const heroTitle = t("hero.title");
  const goodToKnowNotes = t.raw("goodToKnow.notes") as string[];

  return (
    <div className="text-gray-900 pt-14">
      <main>
        <div className="mx-auto max-w-[1160px] px-6 py-14">

          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-14">
            <div className="flex flex-col gap-7 justify-center">
              <div className="bg-white/85 backdrop-blur-md rounded-2xl px-6 py-6 border border-white shadow-md">
                <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8C909D] mb-3">
                  {t("hero.eyebrow")}
                </p>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-[64px] font-extrabold leading-none tracking-[-2px] text-[#111318] mb-1">
                  {heroTitle.slice(0, -1)}
                  <span className="text-emerald-600">{heroTitle.slice(-1)}</span>
                </h1>
                <p className="text-[17px] font-medium text-[#8C909D] mt-3 leading-relaxed max-w-[380px]">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Link href="/apply" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-emerald-700 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {t("hero.applyNow")}
                </Link>
                <Link href="/check" className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E8E9ED] shadow-sm px-6 py-3 text-[15px] font-medium text-[#4B5060] transition-all duration-150 hover:border-[#C0C3CE] hover:-translate-y-px">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                  {t("hero.checkStatus")}
                </Link>
              </div>

              {/* Info card */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-xl px-6 py-5 shadow-md">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-4">
                  {t("serviceHours.title")}
                </p>
                <div className="flex flex-col gap-3">
                  {SERVICE_HOUR_SLOTS.map(({ dayKey, t1, t2 }, i) => (
                    <div key={dayKey}>
                      {i > 0 && <div className="h-px bg-[#E8E9ED] mb-3" />}
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] font-medium text-[#4B5060]">{t(`serviceHours.${dayKey}`)}</span>
                        <div className="text-right">
                          <div className="text-[15px] font-semibold text-[#111318] tabular-nums">{t1}</div>
                          <div className="text-[13px] text-[#8C909D] tabular-nums">{t2}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#8C909D] mt-4 pt-3 border-t border-[#E8E9ED] leading-relaxed">
                  {t("serviceHours.closedNote")}
                  <br />
                  {t("serviceHours.inquiries")}
                </p>
              </div>
            </div>

            {/* Visa categories */}
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D]">
                {t("categories.title")}
              </p>
              {VISA_CATEGORY_CODES.map((code) => {
                const items = t.raw(`categories.${code}.items`) as string[];
                return (
                  <button
                    key={code}
                    onClick={() => setActiveCategory(code)}
                    className="text-left bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-4 shadow-sm flex items-center justify-between gap-4 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-[#111318]">{t(`categories.${code}.title`)}</p>
                      <p className="text-[13px] text-[#8C909D]">{items.join(" / ")}</p>
                    </div>
                    <span className="shrink-0 flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">{code}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{t("categories.requirements")}</span>
                    </span>
                  </button>
                );
              })}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                <span className="font-bold">{t("categories.note")}</span> {t("categories.noteText")}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="pb-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-6">
              {t("howToApply.title")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOW_TO_APPLY_STEPS.map(({ step, titleKey, descKey }) => (
                <div key={step} className="bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-5 shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold mb-3">{step}</div>
                  <p className="text-[15px] font-semibold text-[#111318] mb-1">{t(`howToApply.${titleKey}`)}</p>
                  <p className="text-[13px] text-[#8C909D] leading-relaxed">{t(`howToApply.${descKey}`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Good to know */}
          <section className="pb-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C909D] mb-6">
              {t("goodToKnow.title")}
            </p>
            <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white shadow-md px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {goodToKnowNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2.5 text-sm text-[#4B5060]">
                    <svg className="h-4 w-4 text-[#8C909D] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    {note}
                  </div>
                ))}
              </div>
              <p className="mt-5 pt-5 border-t border-[#E8E9ED] text-xs text-[#8C909D] leading-relaxed">
                {t("goodToKnow.footerNote")}
              </p>
            </div>
          </section>

        </div>
      </main>

      <RequirementsModal categoryCode={activeCategory} onClose={() => setActiveCategory(null)} />
    </div>
  );
}
