"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { getTranslatedApplicantTypes } from "@/lib/visaConfigI18n";

export default function ApplicantTypeStep({
  value,
  onSelect,
  showError,
}: {
  value: string;
  onSelect: (v: string) => void;
  showError: boolean;
}) {
  const t = useTranslations("applySteps.applicant");
  const tVisa = useTranslations("visaConfig");
  const applicantTypes = getTranslatedApplicantTypes(tVisa);

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {applicantTypes.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                active
                  ? "border-red-500 bg-red-50 ring-1 ring-red-500"
                  : "border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    active ? "border-red-600 bg-red-600" : "border-gray-300 bg-white"
                  }`}
                />
              </div>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-red-600">
                {item.sub}
              </p>
              <p className="mt-1 text-xs text-gray-600">{item.hint}</p>
            </button>
          );
        })}
      </div>
      <FieldError show={showError} message={t("selectError")} />
    </SectionCard>
  );
}
