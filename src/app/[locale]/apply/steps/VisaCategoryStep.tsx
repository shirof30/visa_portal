"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { categoryNeedsSponsorLetter } from "../config/visaConfig";
import { getTranslatedCategories } from "@/lib/visaConfigI18n";

export default function VisaCategoryStep({
  value,
  onSelect,
  showError,
}: {
  value: string;
  onSelect: (categoryCode: string) => void;
  showError: boolean;
}) {
  const t = useTranslations("applySteps.category");
  const tVisa = useTranslations("visaConfig");
  const categories = getTranslatedCategories(tVisa);

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 gap-3">
        {categories.map((cat) => {
          const active = value === cat.code;
          const needsSponsor = categoryNeedsSponsorLetter(cat.code);
          return (
            <button
              key={cat.code}
              type="button"
              onClick={() => onSelect(cat.code)}
              className={`text-left rounded-xl border px-4 py-3.5 transition cursor-pointer ${
                active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-6 px-2 rounded bg-gray-800 text-white text-xs font-bold shrink-0 mt-0.5">
                  {cat.code}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{cat.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.itemsId}</p>
                  <p className="text-xs text-gray-400 mt-1">{cat.items.join(" · ")}</p>
                  {needsSponsor && (
                    <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t("sponsorRequired")}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <FieldError show={showError} message={t("selectError")} />
      <p className="text-[11px] text-gray-400">{t("note")}</p>
    </SectionCard>
  );
}
