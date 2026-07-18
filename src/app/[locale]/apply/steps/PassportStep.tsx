"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { PASSPORT_TYPES } from "../config/visaConfig";
import { getTranslatedEnumOptions } from "@/lib/visaConfigI18n";

export default function PassportStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
}: {
  form: {
    passportNumber: string;
    passportPlace: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    passportType: string;
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  const t = useTranslations("applySteps.passport");
  const tVisa = useTranslations("visaConfig");
  const passportTypeOptions = getTranslatedEnumOptions(tVisa, "passportType", PASSPORT_TYPES);
  const thisYear = new Date().getFullYear();

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("passportNumber")}</label>
          <input
            className={fieldCls(inv(!form.passportNumber.trim()))}
            name="passportNumber"
            maxLength={20}
            value={form.passportNumber}
            onChange={(e) =>
              handleChange({
                target: { name: "passportNumber", value: e.target.value.toUpperCase() },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder={t("passportNumberPlaceholder")}
            required
          />
          <FieldError show={inv(!form.passportNumber.trim())} message={t("errors.number")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("placeOfIssuance")}</label>
          <input
            className={fieldCls(inv(!form.passportPlace.trim()))}
            name="passportPlace"
            maxLength={80}
            value={form.passportPlace}
            onChange={handleChange}
            placeholder={t("placePlaceholder")}
            required
          />
          <FieldError show={inv(!form.passportPlace.trim())} message={t("errors.place")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-900">{t("dateOfIssuance")}</p>
            <p className="text-[11px] text-gray-500">{t("dateOfIssuanceHint")}</p>
          </div>
          <DateSelect
            label=""
            name="passportIssueDate"
            value={form.passportIssueDate}
            onChange={handleChange}
            required
            max={todayStr}
            yearStart={1990}
            yearEnd={thisYear}
          />
          <FieldError show={inv(!form.passportIssueDate)} message={t("errors.issueDate")} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-900">{t("dateOfExpiry")}</p>
            <p className="text-[11px] text-gray-500">{t("dateOfExpiryHint")}</p>
          </div>
          <DateSelect
            label=""
            name="passportExpiryDate"
            value={form.passportExpiryDate}
            onChange={handleChange}
            required
            min={todayStr}
            yearStart={thisYear}
            yearEnd={thisYear + 15}
          />
          <FieldError show={inv(!form.passportExpiryDate)} message={t("errors.expiryDate")} />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">{t("passportType")}</label>
        <div className="flex flex-wrap gap-4">
          {passportTypeOptions.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="passportType"
                value={value}
                checked={form.passportType === value}
                onChange={handleChange}
                className="accent-red-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        {t("validityNote")}
      </div>
    </SectionCard>
  );
}
