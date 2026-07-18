"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import type { UploadItem } from "../ui/UploadRow";
import {
  getTranslatedApplicantTypes,
  getTranslatedCategories,
  getTranslatedUploads,
  translateEnumLabel,
} from "@/lib/visaConfigI18n";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

export default function ReviewStep({
  form,
  files,
  uploadItems: _uploadItems,
  show,
  onEdit,
  inv,
  fieldCls,
  handleChange,
  todayStr: _todayStr,
}: {
  form: any;
  files: Record<string, File | null>;
  uploadItems: UploadItem[];
  show: (v: any) => string;
  onEdit: (stepId: string) => void;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  todayStr: string;
}) {
  const t = useTranslations("applySteps.review");
  const tCommon = useTranslations("common");
  const tVisa = useTranslations("visaConfig");

  const applicantLabel =
    getTranslatedApplicantTypes(tVisa).find((item) => item.value === form.applicantType)?.label ??
    tCommon("dash");

  const categoryTitle =
    getTranslatedCategories(tVisa).find((c) => c.code === form.visaCategory)?.title ?? tCommon("dash");

  const uploadItems = useMemo(
    () => getTranslatedUploads(tVisa, form.applicantType, form.hasInvitationLetter, form.visaCategory),
    [tVisa, form.applicantType, form.hasInvitationLetter, form.visaCategory]
  );

  const fullName = [form.firstName, form.middleName, form.familyName].filter(Boolean).join(" ");

  const yesNo = (val: string) => {
    if (val === "Yes") return tCommon("yes");
    if (val === "No") return tCommon("no");
    return val || tCommon("dash");
  };

  const card = "rounded-xl border border-gray-200 bg-gray-50 p-4";
  const editBtn = "text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer";

  return (
    <SectionCard subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.applicantCategory")}</p>
            <button type="button" onClick={() => onEdit("category")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.applicantType")} value={applicantLabel} />
            <Row label={t("labels.visaCategory")} value={categoryTitle} />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.visaTypePurpose")}</p>
            <button type="button" onClick={() => onEdit("purpose")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row
              label={t("labels.typeOfVisa")}
              value={show(translateEnumLabel(tVisa, "typeOfVisa", form.typeOfVisaRequested))}
            />
            <Row
              label={t("labels.purposeOfVisit")}
              value={show(
                form.purposeOfVisit === "Others"
                  ? form.purposeOther
                  : translateEnumLabel(tVisa, "purposeOfVisit", form.purposeOfVisit)
              )}
            />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.personal")}</p>
            <button type="button" onClick={() => onEdit("personal")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.name")} value={show(fullName)} />
            <Row label={t("labels.sex")} value={show(translateEnumLabel(tVisa, "sex", form.sex))} />
            <Row label={t("labels.dateOfBirth")} value={show(form.dateOfBirth)} />
            <Row label={t("labels.placeOfBirth")} value={show(form.placeOfBirth)} />
            <Row label={t("labels.nationality")} value={show(form.nationality)} />
            <Row
              label={t("labels.maritalStatus")}
              value={show(translateEnumLabel(tVisa, "maritalStatus", form.maritalStatus))}
            />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.passport")}</p>
            <button type="button" onClick={() => onEdit("passport")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.number")} value={show(form.passportNumber)} />
            <Row label={t("labels.placeOfIssue")} value={show(form.passportPlace)} />
            <Row label={t("labels.issued")} value={show(form.passportIssueDate)} />
            <Row label={t("labels.expires")} value={show(form.passportExpiryDate)} />
            <Row
              label={t("labels.type")}
              value={show(translateEnumLabel(tVisa, "passportType", form.passportType))}
            />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.address")}</p>
            <button type="button" onClick={() => onEdit("address")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.street")} value={show([form.addressUnit, form.addressStreet].filter(Boolean).join(", "))} />
            <Row label={t("labels.city")} value={show(form.addressCity)} />
            <Row label={t("labels.province")} value={show(form.addressProvince)} />
            <Row label={t("labels.postalCode")} value={show(form.addressPostalCode)} />
            <Row label={t("labels.phone")} value={show(form.phoneNumber)} />
            <Row label={t("labels.email")} value={show(form.email)} />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.occupation")}</p>
            <button type="button" onClick={() => onEdit("occupation")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.employer")} value={show(form.occupationEmployer)} />
            <Row label={t("labels.position")} value={show(form.occupationPosition)} />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.indonesia")}</p>
            <button type="button" onClick={() => onEdit("indonesia")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.address")} value={show(form.intendedAddressIndonesia)} />
            <Row label={t("labels.cityProvince")} value={show(form.intendedCityIndonesia)} />
            <Row label={t("labels.entry")} value={show([form.portOfEntry, form.dateOfEntry].filter(Boolean).join(" • "))} />
            <Row label={t("labels.exit")} value={show([form.portOfExit, form.dateOfExit].filter(Boolean).join(" • "))} />
            <Row
              label={t("labels.invitationLetter")}
              value={form.hasInvitationLetter ? tCommon("yes") : tCommon("no")}
            />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.sponsor")}</p>
            <button type="button" onClick={() => onEdit("sponsor")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.name")} value={show(form.sponsorName)} />
            <Row label={t("labels.company")} value={show(form.sponsorCompany)} />
            <Row label={t("labels.phone")} value={show(form.sponsorPhone)} />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.background")}</p>
            <button type="button" onClick={() => onEdit("background")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={t("labels.beenToIndonesia")} value={yesNo(form.beenToIndonesiaBefore)} />
            <Row label={t("labels.otherVisa")} value={yesNo(form.hasOtherCountryVisa)} />
            <Row label={t("labels.visaDenied")} value={yesNo(form.visaDenied)} />
            <Row label={t("labels.orderedToLeave")} value={yesNo(form.orderedToLeave)} />
            <Row label={t("labels.arrested")} value={yesNo(form.everArrested)} />
          </div>
        </div>

        <div className={`${card} md:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.documents")}</p>
            <button type="button" onClick={() => onEdit("uploads")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {uploadItems.map((it) => {
              const f = files[it.key];
              const missing = it.required && !f;
              return (
                <div key={it.key} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">
                      {it.label} {it.required && <span className="text-red-600">*</span>}
                    </p>
                    <p className={`text-[11px] ${missing ? "text-red-600" : "text-gray-600"} truncate`}>
                      {f ? f.name : missing ? t("documentMissing") : t("documentNotUploaded")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t("sections.delivery")}</p>
            <button type="button" onClick={() => onEdit("delivery")} className={editBtn}>
              {tCommon("edit")}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <Row
              label={t("labels.method")}
              value={
                form.submissionMethod === "mail"
                  ? t("submissionMail")
                  : form.submissionMethod === "in_person"
                  ? t("submissionInPerson")
                  : tCommon("dash")
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-600 italic leading-relaxed">{t("declaration")}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">{t("signatureLabel")}</label>
            <input
              className={fieldCls(inv(!form.signatureName.trim()))}
              name="signatureName"
              maxLength={100}
              value={form.signatureName}
              onChange={handleChange}
              placeholder={t("signaturePlaceholder")}
              required
            />
            <FieldError show={inv(!form.signatureName.trim())} message={t("signatureError")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t("dateLabel")}</label>
            <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base text-gray-600">
              {new Date(form.signatureDate + "T12:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
