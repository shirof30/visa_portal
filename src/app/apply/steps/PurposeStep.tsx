import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import { PURPOSE_OF_VISIT } from "../config/visaConfig";

export default function PurposeStep({
  form,
  inv,
  fieldCls,
  onSelectPurpose,
  onChangePurposeOther,
}: {
  form: {
    purposeOfVisit: string;
    purposeOther: string;
  };
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  onSelectPurpose: (purpose: string) => void;
  onChangePurposeOther: (v: string) => void;
}) {
  return (
    <SectionCard
      title="Purpose of Visit"
      subtitle="This is exactly what appears at the top of the official Visa Application Form. Every application through this portal is a Single Entry Visa."
    >
      {/* Purpose of visit */}
      <div>
        <label className="block mb-2 font-medium">
          Purpose of visit to Indonesia (choose one, according to the nature of your visit)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PURPOSE_OF_VISIT.map((p) => {
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
        <FieldError show={inv(!form.purposeOfVisit)} message="Please select a purpose of visit." />
        {form.purposeOfVisit === "Others" && (
          <div className="mt-3">
            <label className="block mb-1 font-medium">Please specify</label>
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
      </div>
    </SectionCard>
  );
}
