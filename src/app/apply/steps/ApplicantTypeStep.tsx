import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { APPLICANT_TYPES } from "../config/visaConfig";

export default function ApplicantTypeStep({
  value,
  onSelect,
  showError,
}: {
  value: string;
  onSelect: (v: string) => void;
  showError: boolean;
}) {
  return (
    <SectionCard
      title="Applicant Type"
      subtitle="This determines the supporting documents you will need to upload."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {APPLICANT_TYPES.map((t) => {
          const active = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onSelect(t.value)}
              className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                active
                  ? "border-red-500 bg-red-50 ring-1 ring-red-500"
                  : "border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    active ? "border-red-600 bg-red-600" : "border-gray-300 bg-white"
                  }`}
                />
              </div>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-red-600">
                {t.sub}
              </p>
              <p className="mt-1 text-xs text-gray-600">{t.hint}</p>
            </button>
          );
        })}
      </div>
      <FieldError show={showError} message="Please select your applicant type." />
    </SectionCard>
  );
}
