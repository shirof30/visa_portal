"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";

export default function IndonesiaStayStep({
  form,
  fieldCls,
  handleChange,
  todayStr,
  hasInvitationLetter,
  onToggleInvitationLetter,
}: {
  form: {
    intendedAddressIndonesia: string;
    intendedCityIndonesia: string;
    intendedPhone: string;
    portOfEntry: string;
    dateOfEntry: string;
    flightIn: string;
    portOfExit: string;
    dateOfExit: string;
    flightOut: string;
  };
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  todayStr: string;
  hasInvitationLetter: boolean;
  onToggleInvitationLetter: (v: boolean) => void;
}) {
  const t = useTranslations("applySteps.indonesia");
  const tCommon = useTranslations("common");

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div>
        <label className="block mb-1 font-medium">{t("intendedAddress")}</label>
        <input
          className={fieldCls(false)}
          name="intendedAddressIndonesia"
          maxLength={200}
          value={form.intendedAddressIndonesia}
          onChange={handleChange}
          placeholder={t("intendedAddressPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("cityProvince")}</label>
          <input
            className={fieldCls(false)}
            name="intendedCityIndonesia"
            maxLength={100}
            value={form.intendedCityIndonesia}
            onChange={handleChange}
            placeholder={t("cityProvincePlaceholder")}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("phoneIndonesia")}</label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            >
              +62
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              className={fieldCls(false, "pl-12")}
              name="intendedPhone"
              maxLength={13}
              value={form.intendedPhone.replace(/^\+62/, "")}
              onChange={(e) => {
                let digits = e.target.value.replace(/\D/g, "");
                digits = digits.replace(/^62/, "").replace(/^0+/, "").slice(0, 13);
                handleChange({
                  target: {
                    name: "intendedPhone",
                    value: digits ? `+62${digits}` : "",
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              placeholder={t("phonePlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">{t("flightTitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">{t("portOfEntry")}</label>
            <input className={fieldCls(false)} name="portOfEntry" maxLength={80} value={form.portOfEntry} onChange={handleChange} placeholder={t("portOfEntryPlaceholder")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("dateOfEntry")}</label>
            <input type="date" className={fieldCls(false)} name="dateOfEntry" min={todayStr} value={form.dateOfEntry} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("flightIn")}</label>
            <input className={fieldCls(false)} name="flightIn" maxLength={20} value={form.flightIn} onChange={handleChange} placeholder={t("flightInPlaceholder")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("portOfExit")}</label>
            <input className={fieldCls(false)} name="portOfExit" maxLength={80} value={form.portOfExit} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("dateOfExit")}</label>
            <input type="date" className={fieldCls(false)} name="dateOfExit" min={form.dateOfEntry || todayStr} value={form.dateOfExit} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("flightOut")}</label>
            <input className={fieldCls(false)} name="flightOut" maxLength={20} value={form.flightOut} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">{t("invitationTitle")}</p>
        <div className="flex gap-6">
          {[
            { label: tCommon("yes"), val: true },
            { label: tCommon("no"), val: false },
          ].map((opt) => (
            <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="hasInvitationLetter"
                checked={hasInvitationLetter === opt.val}
                onChange={() => onToggleInvitationLetter(opt.val)}
                className="accent-red-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {hasInvitationLetter && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            {t("invitationYesNote")}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
