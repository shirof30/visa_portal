"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { MARITAL_STATUSES } from "../config/visaConfig";
import { COUNTRIES } from "@/lib/countries";
import { getTranslatedEnumOptions } from "@/lib/visaConfigI18n";

export default function PersonalStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
  excludedNationalities = [],
}: {
  form: {
    firstName: string;
    middleName: string;
    familyName: string;
    sex: string;
    placeOfBirth: string;
    dateOfBirth: string;
    nationality: string;
    maritalStatus: string;
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  excludedNationalities?: string[];
}) {
  const t = useTranslations("applySteps.personal");
  const tCommon = useTranslations("common");
  const tVisa = useTranslations("visaConfig");

  const sexOptions = getTranslatedEnumOptions(tVisa, "sex", ["Male", "Female"]);
  const maritalOptions = getTranslatedEnumOptions(tVisa, "maritalStatus", MARITAL_STATUSES);

  const nationalityOptions = useMemo(() => {
    const excluded = new Set(excludedNationalities);
    return COUNTRIES.filter((c) => !excluded.has(c) || c === form.nationality);
  }, [excludedNationalities, form.nationality]);

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">{t("firstName")}</label>
          <input
            className={fieldCls(inv(!form.firstName.trim()))}
            name="firstName"
            maxLength={50}
            value={form.firstName}
            onChange={handleChange}
            placeholder={t("asInPassport")}
            required
          />
          <FieldError show={inv(!form.firstName.trim())} message={t("errors.firstName")} />
        </div>
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">
            {t("middleName")}{" "}
            <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
          </label>
          <input
            className={fieldCls(false)}
            name="middleName"
            maxLength={50}
            value={form.middleName}
            onChange={handleChange}
            placeholder={t("asInPassport")}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">{t("familyName")}</label>
          <input
            className={fieldCls(inv(!form.familyName.trim()))}
            name="familyName"
            maxLength={50}
            value={form.familyName}
            onChange={handleChange}
            placeholder={t("asInPassport")}
            required
          />
          <FieldError show={inv(!form.familyName.trim())} message={t("errors.familyName")} />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">{t("sex")}</label>
        <div className="flex gap-6">
          {sexOptions.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="sex"
                value={value}
                checked={form.sex === value}
                onChange={handleChange}
                className="accent-red-600"
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError show={inv(!form.sex)} message={t("errors.sex")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("placeOfBirth")}</label>
          <input
            className={fieldCls(inv(!form.placeOfBirth.trim()))}
            name="placeOfBirth"
            maxLength={100}
            value={form.placeOfBirth}
            onChange={handleChange}
            placeholder={t("placeOfBirthPlaceholder")}
            required
          />
          <FieldError show={inv(!form.placeOfBirth.trim())} message={t("errors.placeOfBirth")} />
        </div>
        <div>
          <DateSelect
            label={t("dateOfBirth")}
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            max={todayStr}
            yearStart={1900}
            yearEnd={new Date().getFullYear()}
          />
          <FieldError show={inv(!form.dateOfBirth)} message={t("errors.dateOfBirth")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("nationality")}</label>
          <select
            className={fieldCls(inv(!form.nationality.trim()))}
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            required
          >
            <option value="">{tCommon("select")}</option>
            {nationalityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError show={inv(!form.nationality.trim())} message={t("errors.nationality")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("maritalStatus")}{" "}
            <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
          </label>
          <select className={fieldCls(false)} name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
            <option value="">{tCommon("select")}</option>
            {maritalOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
