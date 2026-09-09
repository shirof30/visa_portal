"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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

// ─── Motion presets ───────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

function RequirementsModal({
  categoryCode,
  onClose,
}: {
  categoryCode: VisaCategoryCode | null;
  onClose: () => void;
}) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <AnimatePresence>
      {categoryCode && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {(() => {
              const isTourism = categoryCode === "C1";
              const items = t.raw(`categories.${categoryCode}.items`) as string[];
              const mandatory = t.raw("requirementsModal.mandatory") as string[];
              const additional = t.raw("requirementsModal.additional") as string[];
              return (
                <>
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
                      className="shrink-0 h-8 w-8 rounded-lg border border-[#E8E9ED] text-[#8C909D] hover:text-[#111318] hover:bg-gray-50 hover:rotate-90 transition-all duration-200 cursor-pointer flex items-center justify-center"
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

                    {categoryCode === "C5" && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                        <p className="font-bold text-amber-900 mb-1">{t("requirementsModal.c5ExtraNoteTitle")}</p>
                        <p>{t("requirementsModal.c5ExtraNote")}</p>
                      </div>
                    )}

                    <p className="text-xs text-[#8C909D] leading-relaxed">
                      {t("requirementsModal.submitNote")}
                    </p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Decorative, purely visual — slow-drifting blurred color fields behind the hero.
function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-300/25 blur-[90px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-32 h-[380px] w-[380px] rounded-full bg-amber-200/25 blur-[100px]"
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-sky-200/20 blur-[90px]"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const [activeCategory, setActiveCategory] = useState<VisaCategoryCode | null>(null);

  const heroTitle = t("hero.title");
  const goodToKnowNotes = t.raw("goodToKnow.notes") as string[];

  const stepAccents = [
    { ring: "ring-emerald-100", bg: "bg-emerald-600", glow: "shadow-emerald-500/30" },
    { ring: "ring-sky-100", bg: "bg-sky-600", glow: "shadow-sky-500/30" },
    { ring: "ring-amber-100", bg: "bg-amber-500", glow: "shadow-amber-500/30" },
  ];

  return (
    <div className="relative text-gray-900 pt-14 overflow-hidden">
      <main>
        <div className="relative mx-auto max-w-[1160px] px-6 py-14">
          <AmbientBackdrop />

          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-14">
            <motion.div
              className="flex flex-col gap-7 justify-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={fadeUp}
                className="relative bg-white/85 backdrop-blur-md rounded-2xl px-6 py-6 border border-white shadow-md overflow-hidden"
              >
                <motion.span
                  aria-hidden
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="relative flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8C909D] mb-3">
                  <motion.svg
                    aria-hidden
                    className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    animate={{ y: [0, -3, 0], x: [0, 2, 0], rotate: [0, 6, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M21.5 2.5c.6 0 1 .4 1 1 0 3.6-1.4 7-4 9.5l-2.2 2.2.7 4.9c.1.5-.1 1-.5 1.3l-1.6 1.2a1 1 0 0 1-1.6-.6l-1.5-5-2.4 2.4.4 2.4a1 1 0 0 1-.3.9l-.8.8a1 1 0 0 1-1.5-.1l-2-2.7-2.7-2a1 1 0 0 1-.1-1.5l.8-.8c.2-.2.6-.4.9-.3l2.4.4 2.4-2.4-5-1.5a1 1 0 0 1-.6-1.6l1.2-1.6c.3-.4.8-.6 1.3-.5l4.9.7 2.2-2.2c2.5-2.6 5.9-4 9.5-4Z" />
                  </motion.svg>
                  {t("hero.eyebrow")}
                </p>
                <h1 className="relative font-['Plus_Jakarta_Sans',sans-serif] text-[64px] font-extrabold leading-none tracking-[-2px] text-[#111318] mb-1">
                  {heroTitle.slice(0, -1)}
                  <motion.span
                    className="inline-block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent"
                    style={{ backgroundSize: "200% auto" }}
                    animate={{ backgroundPosition: ["0% center", "100% center", "0% center"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    {heroTitle.slice(-1)}
                  </motion.span>
                </h1>
                <p className="relative text-[17px] font-medium text-[#8C909D] mt-3 leading-relaxed max-w-[380px]">
                  {t("hero.subtitle")}
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
                <Link
                  href="/apply"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-emerald-600 px-7 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                  <svg className="relative w-4 h-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative">{t("hero.applyNow")}</span>
                </Link>
                <Link
                  href="/check"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white border border-[#E8E9ED] shadow-sm px-6 py-3 text-[15px] font-medium text-[#4B5060] transition-all duration-200 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                  {t("hero.checkStatus")}
                </Link>
              </motion.div>

              {/* Info card */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-xl px-6 py-5 shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
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
                          <div className="text-[15px] font-semibold text-[#111318] tabular-nums">{t2}</div>
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
              </motion.div>
            </motion.div>

            {/* Visa categories */}
            <motion.div
              className="flex flex-col gap-4 justify-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.p variants={fadeUp} className="inline-block self-start bg-white/70 backdrop-blur-sm rounded-md px-2.5 py-1 shadow-sm text-[12px] font-bold uppercase tracking-[0.1em] text-[#5B6070]">
                {t("categories.title")}
              </motion.p>
              {VISA_CATEGORY_CODES.map((code) => {
                const items = t.raw(`categories.${code}.items`) as string[];
                return (
                  <motion.button
                    key={code}
                    variants={fadeUp}
                    whileHover={{ y: -3, scale: 1.012 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveCategory(code)}
                    className="group relative text-left bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-4 shadow-sm flex items-center justify-between gap-4 overflow-hidden hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-[border-color,box-shadow] cursor-pointer"
                  >
                    <span className="absolute inset-y-0 left-0 w-1 scale-y-0 bg-emerald-500 transition-transform duration-300 origin-center group-hover:scale-y-100" />
                    <div>
                      <p className="text-[15px] font-semibold text-[#111318]">{t(`categories.${code}.title`)}</p>
                      <p className="text-[13px] text-[#8C909D]">{items.join(" / ")}</p>
                    </div>
                    <span className="shrink-0 flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600">{code}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                        {t("categories.requirements")}
                        <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </span>
                  </motion.button>
                );
              })}
              <motion.div variants={fadeUp} className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                <span className="font-bold">{t("categories.note")}</span> {t("categories.noteText")}
              </motion.div>
            </motion.div>
          </section>

          {/* How it works */}
          <motion.section
            className="relative pb-14"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} className="inline-block bg-white/70 backdrop-blur-sm rounded-md px-2.5 py-1 shadow-sm text-[12px] font-bold uppercase tracking-[0.1em] text-[#5B6070] mb-6">
              {t("howToApply.title")}
            </motion.p>
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                aria-hidden
                className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-300 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
              />
              {HOW_TO_APPLY_STEPS.map(({ step, titleKey, descKey }, i) => {
                const accent = stepAccents[i % stepAccents.length];
                return (
                  <motion.div
                    key={step}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="relative bg-white/85 backdrop-blur-md rounded-xl border border-white px-5 py-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
                  >
                    <motion.div
                      variants={scaleIn}
                      className={`h-8 w-8 rounded-full ${accent.bg} ring-4 ${accent.ring} flex items-center justify-center text-white text-sm font-bold mb-3 shadow-lg ${accent.glow}`}
                    >
                      {step}
                    </motion.div>
                    <p className="text-[15px] font-semibold text-[#111318] mb-1">{t(`howToApply.${titleKey}`)}</p>
                    <p className="text-[13px] text-[#8C909D] leading-relaxed">{t(`howToApply.${descKey}`)}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Good to know */}
          <motion.section
            className="pb-14"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} className="inline-block bg-white/70 backdrop-blur-sm rounded-md px-2.5 py-1 shadow-sm text-[12px] font-bold uppercase tracking-[0.1em] text-[#5B6070] mb-6">
              {t("goodToKnow.title")}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="bg-white/85 backdrop-blur-md rounded-2xl border border-white shadow-md px-6 py-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {goodToKnowNotes.map((note, i) => (
                  <motion.div
                    key={note}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                    className="flex items-start gap-2.5 text-sm text-[#4B5060]"
                  >
                    <svg className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    {note}
                  </motion.div>
                ))}
              </div>
              <p className="mt-5 pt-5 border-t border-[#E8E9ED] text-xs text-[#8C909D] leading-relaxed">
                {t("goodToKnow.footerNote")}
              </p>
            </motion.div>
          </motion.section>

        </div>
      </main>

      <RequirementsModal categoryCode={activeCategory} onClose={() => setActiveCategory(null)} />
    </div>
  );
}
