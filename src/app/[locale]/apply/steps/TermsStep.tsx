"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

export default function TermsStep({
  accepted,
  setAccepted,
  showError,
}: {
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  showError: boolean;
}) {
  const t = useTranslations("applySteps.terms");

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="rounded-xl border border-gray-200 bg-gray-50 max-h-72 overflow-y-auto p-4 text-xs leading-relaxed text-gray-700 space-y-3">
        <div>
          <p className="font-semibold text-gray-900 mb-1">{t("sections.accuracyTitle")}</p>
          <p>{t("sections.accuracyBody")}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">{t("sections.passportTitle")}</p>
          <p>{t("sections.passportBody")}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">{t("sections.documentsTitle")}</p>
          <p>{t("sections.documentsBody")}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">{t("sections.entryTitle")}</p>
          <p>{t("sections.entryBody")}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">{t("sections.feesTitle")}</p>
          <p>{t("sections.feesBody")}</p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-red-200 bg-red-50 p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        <span className="text-xs leading-relaxed text-gray-800">{t("acceptLabel")}</span>
      </label>
      <FieldError show={showError} message={t("acceptError")} />
    </SectionCard>
  );
}
