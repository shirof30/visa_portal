import React from "react";
import SectionCard from "../ui/SectionCard";

function YesNo({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-6">
      {["Yes", "No"].map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-red-600"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

type BgForm = {
  beenToIndonesiaBefore: string;
  indonesiaVisitDetails: string;
  hasOtherCountryVisa: string;
  otherVisaDetails: string;
  visaDenied: string;
  orderedToLeave: string;
  everArrested: string;
};

export default function BackgroundStep({
  form,
  fieldCls,
  setField,
}: {
  form: BgForm;
  fieldCls: (invalid: boolean, extra?: string) => string;
  setField: (name: keyof BgForm, value: string) => void;
}) {
  const withDetails = [
    { k: "beenToIndonesiaBefore", l: "Have you ever been to Indonesia before?", dk: "indonesiaVisitDetails", dp: "When and how long did you stay?" },
    { k: "hasOtherCountryVisa", l: "Do you currently hold another country's valid visa?", dk: "otherVisaDetails", dp: "Country of issuance" },
  ] as const;

  const simple = [
    { k: "visaDenied", l: "Has your application for an Indonesian visa ever been denied?" },
    { k: "orderedToLeave", l: "Have you ever been ordered to leave Indonesia?" },
    { k: "everArrested", l: "Have you ever been arrested or convicted of a criminal act?" },
  ] as const;

  return (
    <SectionCard
      subtitle="Answer truthfully. A YES answer does not automatically disqualify your application."
    >
      {withDetails.map(({ k, l, dk, dp }) => (
        <div key={k} className="space-y-2">
          <label className="block font-medium">{l}</label>
          <YesNo name={k} value={form[k]} onChange={(v) => setField(k, v)} />
          {form[k] === "Yes" && (
            <input
              className={fieldCls(false)}
              value={form[dk]}
              maxLength={200}
              onChange={(e) => setField(dk, e.target.value)}
              placeholder={dp}
            />
          )}
        </div>
      ))}

      {simple.map(({ k, l }) => (
        <div key={k} className="space-y-2">
          <label className="block font-medium">{l}</label>
          <YesNo name={k} value={form[k]} onChange={(v) => setField(k, v)} />
        </div>
      ))}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        While a YES answer does not automatically signify ineligibility for a visa, you may be
        required to personally appear before a consular officer.
      </div>
    </SectionCard>
  );
}
