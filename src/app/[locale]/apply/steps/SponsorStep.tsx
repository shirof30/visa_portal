"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

export default function SponsorStep({
  form,
  required,
  inv,
  fieldCls,
  handleChange,
}: {
  form: {
    sponsorName: string;
    sponsorPosition: string;
    sponsorCompany: string;
    sponsorAddress: string;
    sponsorCityProvincePostal: string;
    sponsorPhone: string;
    sponsorFax: string;
  };
  required: boolean;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  const t = useTranslations("applySteps.sponsor");
  const tCommon = useTranslations("common");

  return (
    <SectionCard
      title={t("title")}
      subtitle={required ? t("subtitleRequired") : t("subtitleOptional")}
    >
      {required && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          {t("requiredNote")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            {t("fullName")}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            className={fieldCls(inv(required && !form.sponsorName.trim()))}
            name="sponsorName"
            maxLength={80}
            value={form.sponsorName}
            onChange={handleChange}
          />
          <FieldError show={inv(required && !form.sponsorName.trim())} message={t("errors.name")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("position")}</label>
          <input className={fieldCls(false)} name="sponsorPosition" maxLength={60} value={form.sponsorPosition} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("company")}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            className={fieldCls(inv(required && !form.sponsorCompany.trim()))}
            name="sponsorCompany"
            maxLength={80}
            value={form.sponsorCompany}
            onChange={handleChange}
          />
          <FieldError show={inv(required && !form.sponsorCompany.trim())} message={t("errors.company")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("phone")}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="tel"
            className={fieldCls(inv(required && !form.sponsorPhone.trim()))}
            name="sponsorPhone"
            maxLength={15}
            value={form.sponsorPhone}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "sponsorPhone",
                  value: e.target.value.replace(/[^0-9+\-() ]/g, "").slice(0, 15),
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder={t("phonePlaceholder")}
          />
          <FieldError show={inv(required && !form.sponsorPhone.trim())} message={t("errors.phone")} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("fax")}{" "}
            <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
          </label>
          <input className={fieldCls(false)} name="sponsorFax" maxLength={20} value={form.sponsorFax} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("cityProvincePostal")}</label>
          <input className={fieldCls(false)} name="sponsorCityProvincePostal" maxLength={100} value={form.sponsorCityProvincePostal} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">
          {t("address")}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          className={fieldCls(inv(required && !form.sponsorAddress.trim()))}
          name="sponsorAddress"
          maxLength={200}
          value={form.sponsorAddress}
          onChange={handleChange}
          placeholder={t("addressPlaceholder")}
        />
        <FieldError show={inv(required && !form.sponsorAddress.trim())} message={t("errors.address")} />
      </div>
    </SectionCard>
  );
}
