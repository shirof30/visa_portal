import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { VISA_CATEGORIES, VISA_PRODUCTS, type VisaCategoryOption } from "../config/visaConfig";

export default function PurposeStep({
  form,
  inv,
  fieldCls,
  onSelectCategory,
  onSelectCategoryOption,
  onSelectVisaProduct,
  onChangePurposeOther,
}: {
  form: {
    visaCategory: string;
    purposeOfVisit: string;
    purposeOther: string;
    visaProductCode: string;
  };
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  onSelectCategory: (categoryCode: string) => void;
  onSelectCategoryOption: (opt: VisaCategoryOption) => void;
  onSelectVisaProduct: (productCode: string) => void;
  onChangePurposeOther: (v: string) => void;
}) {
  const selectedCategory = VISA_CATEGORIES.find((c) => c.code === form.visaCategory);

  return (
    <SectionCard
      title="Visa Category & Type"
      subtitle="First pick the category that matches your visit, then choose the specific visa product."
    >
      {/* ── Step 2a: Visa Category (C1–C5 + Transit) ── */}
      <div>
        <label className="block mb-1 font-medium">Jenis Visa berdasarkan Tujuan Kunjungan</label>
        <p className="text-xs text-gray-500 mb-3">Visa category by purpose of visit — choose the one that matches why you're travelling to Indonesia.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VISA_CATEGORIES.map((cat) => {
            const active = form.visaCategory === cat.code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => onSelectCategory(cat.code)}
                className={`text-left rounded-xl border px-4 py-3 transition cursor-pointer ${
                  active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {cat.code !== "TRANSIT" && (
                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-gray-800 text-white text-[10px] font-bold shrink-0">
                      {cat.code}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-900">{cat.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{cat.titleId}</p>
              </button>
            );
          })}
        </div>
        <FieldError show={inv(!form.visaCategory)} message="Please select a visa category." />

        {selectedCategory && selectedCategory.options.length > 1 && (
          <div className="mt-3">
            <label className="block mb-2 text-xs font-semibold text-gray-600">Specific purpose within {selectedCategory.title}</label>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.options.map((opt) => {
                const active =
                  form.purposeOfVisit === opt.value.purpose &&
                  (opt.value.purpose !== "Others" || form.purposeOther === opt.value.otherLabel);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onSelectCategoryOption(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      active ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:border-red-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <FieldError show={inv(!form.purposeOfVisit)} message="Please select a specific purpose." />
          </div>
        )}
      </div>

      {/* ── Step 2b: Visa Type (the actual product offered) ── */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block mb-1 font-medium">Visa Types Available</label>
        <p className="text-xs text-gray-500 mb-3">Choose the visa product to apply for.</p>
        <div className="grid grid-cols-1 gap-3">
          {VISA_PRODUCTS.map((p) => {
            const active = form.visaProductCode === p.code;
            const suggested = !!form.visaCategory && p.suggestedFor.includes(form.visaCategory);
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => onSelectVisaProduct(p.code)}
                className={`flex items-center justify-between gap-3 text-left rounded-xl border px-4 py-3 transition cursor-pointer ${
                  active ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{p.label}</span>
                    {suggested && !active && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
                        Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.subtitle}</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 shrink-0">
                  {p.code}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError show={inv(!form.visaProductCode)} message="Please select a visa type." />
        <p className="mt-3 text-[11px] text-gray-400">
          Note: Indonesian citizens holding a valid Indonesian passport do not require a visa to
          enter Indonesia. This portal is for non-Indonesian passport holders applying for an
          Indonesian visa through KJRI Vancouver.
        </p>
      </div>

      {form.purposeOfVisit === "Others" && (
        <div>
          <label className="block mb-1 font-medium">Please specify your purpose</label>
          <input
            className={fieldCls(inv(!form.purposeOther.trim()))}
            value={form.purposeOther}
            maxLength={200}
            onChange={(e) => onChangePurposeOther(e.target.value)}
            placeholder="Describe your purpose of visit"
          />
          <FieldError show={inv(!form.purposeOther.trim())} message="Please describe your purpose." />
        </div>
      )}
    </SectionCard>
  );
}
