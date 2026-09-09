"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { MARITAL_STATUSES } from "../config/visaConfig";
import { getTranslatedEnumOptions } from "@/lib/visaConfigI18n";

export default function PersonalStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
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
    phoneNumber: string;
    email: string;
    addressCanadaFax: string;
    addressCanadaCell: string;
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  const t = useTranslations("applySteps.personal");
  const tCommon = useTranslations("common");
  const tVisa = useTranslations("visaConfig");

  const sexOptions = getTranslatedEnumOptions(tVisa, "sex", ["Male", "Female"]);
  const maritalOptions = getTranslatedEnumOptions(tVisa, "maritalStatus", MARITAL_STATUSES);

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
          <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base text-gray-600">
            {form.nationality || tCommon("dash")}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">{t("nationalityLockedHint")}</p>
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

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">{t("contactTitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">{t("phone")}</label>
            <input
              type="text"
              inputMode="numeric"
              className={fieldCls(inv(form.phoneNumber.replace(/\D/g, "").length !== 10))}
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={(e) =>
                handleChange({
                  target: { name: "phoneNumber", value: e.target.value.replace(/\D/g, "").slice(0, 10) },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
              placeholder={t("phonePlaceholder")}
              required
            />
            <FieldError show={inv(form.phoneNumber.replace(/\D/g, "").length !== 10)} message={t("errors.phone")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("email")}</label>
            <input
              type="email"
              className={fieldCls(inv(!form.email.trim()))}
              name="email"
              value={form.email}
              onChange={handleChange}
              maxLength={254}
              placeholder={t("emailPlaceholder")}
              required
            />
            <FieldError show={inv(!form.email.trim())} message={t("errors.email")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("fax")}{" "}
              <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
            </label>
            <input
              className={fieldCls(false)}
              name="addressCanadaFax"
              value={form.addressCanadaFax}
              onChange={handleChange}
              maxLength={20}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("cellular")}{" "}
              <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
            </label>
            <input
              className={fieldCls(false)}
              name="addressCanadaCell"
              value={form.addressCanadaCell}
              onChange={handleChange}
              maxLength={20}
              placeholder={t("cellularPlaceholder")}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
