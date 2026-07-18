"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";

export default function OccupationStep({
  form,
  fieldCls,
  handleChange,
}: {
  form: {
    occupationEmployer: string;
    occupationPosition: string;
    occupationCompanyAddress: string;
    occupationCity: string;
    occupationProvincePostal: string;
    occupationCountry: string;
    occupationPhone: string;
    occupationFax: string;
  };
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  const t = useTranslations("applySteps.occupation");
  const tCommon = useTranslations("common");

  return (
    <SectionCard title={t("title")} subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("employer")}</label>
          <input className={fieldCls(false)} name="occupationEmployer" maxLength={80} value={form.occupationEmployer} onChange={handleChange} placeholder={t("companyNamePlaceholder")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("position")}</label>
          <input className={fieldCls(false)} name="occupationPosition" maxLength={60} value={form.occupationPosition} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">{t("companyAddress")}</label>
          <input className={fieldCls(false)} name="occupationCompanyAddress" maxLength={150} value={form.occupationCompanyAddress} onChange={handleChange} placeholder={t("streetPlaceholder")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("city")}</label>
          <input className={fieldCls(false)} name="occupationCity" maxLength={70} value={form.occupationCity} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("provincePostal")}</label>
          <input className={fieldCls(false)} name="occupationProvincePostal" maxLength={40} value={form.occupationProvincePostal} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("country")}</label>
          <input className={fieldCls(false)} name="occupationCountry" maxLength={60} value={form.occupationCountry} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("workPhone")}</label>
          <input className={fieldCls(false)} name="occupationPhone" maxLength={20} value={form.occupationPhone} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("fax")}{" "}
            <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
          </label>
          <input className={fieldCls(false)} name="occupationFax" maxLength={20} value={form.occupationFax} onChange={handleChange} />
        </div>
      </div>
    </SectionCard>
  );
}
