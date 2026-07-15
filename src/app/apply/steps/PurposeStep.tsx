import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { VISA_CATEGORIES, VISA_TYPES, categoryNeedsSponsor } from "../config/visaConfig";

export default function PurposeStep({
  form,
  inv,
  fieldCls,
  onSelectCategory,
  onSelectPurpose,
  onSelectVisaType,
  onChangePurposeOther,
}: {
  form: {
    categoryCode: string;
    purposeOfVisit: string;
    purposeOther: string;
    visaType: string;
  };
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  onSelectCategory: (code: string) => void;
  onSelectPurpose: (purpose: string) => void;
  onSelectVisaType: (t: string) => void;
  onChangePurposeOther: (v: string) => void;
}) {
  const selectedCategory = VISA_CATEGORIES.find((c) => c.code === form.categoryCode);

  return (
    <SectionCard
      title="Purpose of Visit"
      subtitle="The purpose of your visit determines the visa category and required documents."
    >
      {/* Category (C1–C5) */}
      <div>
        <label className="block mb-2 font-medium">Visa category</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VISA_CATEGORIES.map((c) => {
            const active = form.categoryCode === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => onSelectCategory(c.code)}
                className={`text-left rounded-xl border px-4 py-3 transition cursor-pointer ${
                  active
                    ? "border-red-500 bg-red-50 ring-1 ring-red-500"
                    : "border-gray-200 bg-white hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      active ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.code}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{c.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{c.purposes.join(" • ")}</p>
              </button>
            );
          })}
        </div>
        <FieldError show={inv(!form.categoryCode)} message="Please select a visa category." />
        {selectedCategory && categoryNeedsSponsor(selectedCategory.code) && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            Category {selectedCategory.code} requires a <strong>sponsor / guarantor letter from
            Indonesia</strong>. You will fill in the sponsor details and upload the letter in later
            steps.
          </p>
        )}
      </div>

      {/* Specific purpose */}
      {selectedCategory && (
        <div>
          <label className="block mb-2 font-medium">Specific purpose</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...selectedCategory.purposes, "Others"].map((p) => {
              const active = form.purposeOfVisit === p;
              return (
                <label
                  key={p}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition text-sm ${
                    active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="purposeOfVisit"
                    value={p}
                    checked={active}
                    onChange={() => onSelectPurpose(p)}
                    className="accent-red-600"
                  />
                  {p}
                </label>
              );
            })}
          </div>
          <FieldError show={inv(!form.purposeOfVisit)} message="Please select a specific purpose." />
          {form.purposeOfVisit === "Others" && (
            <div className="mt-3">
              <input
                className={fieldCls(inv(!form.purposeOther.trim()))}
                value={form.purposeOther}
                maxLength={200}
                onChange={(e) => onChangePurposeOther(e.target.value)}
                placeholder="Please describe your purpose of visit"
              />
              <FieldError show={inv(!form.purposeOther.trim())} message="Please describe your purpose." />
            </div>
          )}
        </div>
      )}

      {/* Visa type */}
      <div>
        <label className="block mb-2 font-medium">Type of visa requested</label>
        <div className="grid grid-cols-2 gap-3">
          {VISA_TYPES.map((t) => {
            const active = form.visaType === t;
            return (
              <label
                key={t}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                  active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                }`}
              >
                <input
                  type="radio"
                  name="visaType"
                  value={t}
                  checked={active}
                  onChange={() => onSelectVisaType(t)}
                  className="accent-red-600"
                />
                <span className="text-sm font-medium">{t}</span>
              </label>
            );
          })}
        </div>
        <FieldError show={inv(!form.visaType)} message="Please select a visa type." />
      </div>
    </SectionCard>
  );
}
