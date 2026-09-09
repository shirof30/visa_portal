"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { getTranslatedApplicantTypes } from "@/lib/visaConfigI18n";
import { COUNTRIES } from "@/lib/countries";
import {
  APPLICANT_NON_KANADA,
  isTravelDocumentApplicant,
} from "../config/visaConfig";

function BlockingModal({
  title,
  body,
  onClose,
}: {
  title: string;
  body: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z" />
            </svg>
          </span>
          <h3 className="text-base font-bold text-gray-900 pt-1.5">{title}</h3>
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
        >
          {"OK"}
        </button>
      </div>
    </div>
  );
}

export default function ApplicantTypeStep({
  value,
  onSelect,
  nationality,
  onSelectNationality,
  excludedNationalities = [],
  showError,
}: {
  value: string;
  onSelect: (v: string) => void;
  nationality: string;
  onSelectNationality: (v: string) => void;
  excludedNationalities?: string[];
  showError: boolean;
}) {
  const t = useTranslations("applySteps.applicant");
  const tCommon = useTranslations("common");
  const tVisa = useTranslations("visaConfig");
  const applicantTypes = getTranslatedApplicantTypes(tVisa);

  const isNonCanadian = value === APPLICANT_NON_KANADA;
  const isTravelDoc = isTravelDocumentApplicant(value);
  const isNationalityBlocked =
    isNonCanadian && !!nationality && excludedNationalities.includes(nationality);

  const [showModal, setShowModal] = useState<"nationality" | "travelDoc" | null>(null);

  useEffect(() => {
    if (isTravelDoc) setShowModal("travelDoc");
    else if (isNationalityBlocked) setShowModal("nationality");
    else setShowModal(null);
    // Only re-trigger the popup when the blocking condition itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTravelDoc, isNationalityBlocked]);

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
      <FieldError show={showError && !value} message={t("selectError")} />

      {isNonCanadian && (
        <div className="pt-1">
          <label className="block mb-1 font-medium text-sm">{t("nationalityLabel")}</label>
          <select
            className="w-full rounded-lg border px-3.5 py-2.5 text-base bg-white transition-all duration-150 focus:outline-none focus:ring-4 border-gray-200 focus:border-emerald-500 focus:ring-emerald-50 hover:border-gray-300"
            value={nationality}
            onChange={(e) => onSelectNationality(e.target.value)}
            required
          >
            <option value="">{tCommon("select")}</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError show={showError && !nationality} message={t("nationalityError")} />
        </div>
      )}

      {isTravelDoc && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold mb-1">{t("travelDocBlockedTitle")}</p>
          <p>{t("travelDocBlockedBody")}</p>
        </div>
      )}

      {isNationalityBlocked && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold mb-1">{t("nationalityBlockedTitle")}</p>
          <p>{t("nationalityBlockedBody", { nationality })}</p>
        </div>
      )}

      {showModal === "travelDoc" && (
        <BlockingModal
          title={t("travelDocBlockedTitle")}
          body={t("travelDocBlockedBody")}
          onClose={() => setShowModal(null)}
        />
      )}
      {showModal === "nationality" && (
        <BlockingModal
          title={t("nationalityBlockedTitle")}
          body={t("nationalityBlockedBody", { nationality })}
          onClose={() => setShowModal(null)}
        />
      )}
    </SectionCard>
  );
}
