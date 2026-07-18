"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";

function YesNo({
  name,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="flex gap-6">
      {[
        { label: yesLabel, val: "Yes" },
        { label: noLabel, val: "No" },
      ].map((opt) => (
        <label key={opt.val} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name={name}
            value={opt.val}
            checked={value === opt.val}
            onChange={() => onChange(opt.val)}
            className="accent-red-600"
          />
          {opt.label}
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
  const t = useTranslations("applySteps.background");
  const tCommon = useTranslations("common");

  const yesLabel = tCommon("yes");
  const noLabel = tCommon("no");

  const withDetails = [
    { k: "beenToIndonesiaBefore" as const, l: t("beenToIndonesia"), dk: "indonesiaVisitDetails" as const, dp: t("indonesiaDetailsPlaceholder") },
    { k: "hasOtherCountryVisa" as const, l: t("otherVisa"), dk: "otherVisaDetails" as const, dp: t("otherVisaPlaceholder") },
  ];

  const simple = [
    { k: "visaDenied" as const, l: t("visaDenied") },
    { k: "orderedToLeave" as const, l: t("orderedToLeave") },
    { k: "everArrested" as const, l: t("everArrested") },
  ];

  return (
    <SectionCard subtitle={t("subtitle")}>
      {withDetails.map(({ k, l, dk, dp }) => (
        <div key={k} className="space-y-2">
          <label className="block font-medium">{l}</label>
          <YesNo name={k} value={form[k]} onChange={(v) => setField(k, v)} yesLabel={yesLabel} noLabel={noLabel} />
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
          <YesNo name={k} value={form[k]} onChange={(v) => setField(k, v)} yesLabel={yesLabel} noLabel={noLabel} />
        </div>
      ))}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        {t("disclaimer")}
      </div>
    </SectionCard>
  );
}
