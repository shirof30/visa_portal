import type { UploadItem } from "@/app/[locale]/apply/ui/UploadRow";
import {
  APPLICANT_TYPES,
  VISA_CATEGORIES,
  TYPE_OF_VISA_REQUESTED,
  PASSPORT_TYPES,
  MARITAL_STATUSES,
  PURPOSE_OF_VISIT,
  CATEGORY_PURPOSE_MAP,
  CATEGORY_OTHERS_DEFAULT,
  categoryNeedsSponsorLetter,
  APPLICANT_NON_KANADA,
} from "@/app/[locale]/apply/config/visaConfig";

type TFunc = {
  (key: string, values?: Record<string, string | number | Date>): string;
  raw: (key: string) => unknown;
};

const ACCEPT = "application/pdf,image/jpeg,image/jpg";

export function getTranslatedApplicantTypes(t: TFunc) {
  return APPLICANT_TYPES.map((item) => ({
    ...item,
    label: t(`applicantTypes.${item.value}.label`),
    sub: t(`applicantTypes.${item.value}.sub`),
    hint: t(`applicantTypes.${item.value}.hint`),
  }));
}

export function getTranslatedCategories(t: TFunc) {
  return VISA_CATEGORIES.map((cat) => ({
    ...cat,
    title: t(`categories.${cat.code}.title`),
    items: (t.raw(`categories.${cat.code}.items`) as string[]) ?? cat.items,
    itemsId: t(`categories.${cat.code}.itemsId`),
  }));
}

export function getTranslatedEnumOptions(
  t: TFunc,
  enumKey: "passportType" | "maritalStatus" | "purposeOfVisit" | "typeOfVisa" | "sex",
  values: readonly string[]
) {
  return values.map((value) => ({
    value,
    label: t(`enums.${enumKey}.${value}`),
  }));
}

export function getTranslatedPurposeOptionsForCategory(t: TFunc, categoryCode: string) {
  const allowed = CATEGORY_PURPOSE_MAP[categoryCode];
  const values = allowed && allowed.length ? allowed : PURPOSE_OF_VISIT;
  return getTranslatedEnumOptions(t, "purposeOfVisit", values);
}

export function getTranslatedUploads(
  t: TFunc,
  applicantType: string,
  hasInvitationLetter: boolean,
  visaCategory: string
): UploadItem[] {
  const items: UploadItem[] = [
    {
      key: "passportScan",
      label: t("uploads.passportScan.label"),
      hint: t("uploads.passportScan.hint"),
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    },
    {
      key: "photoScan",
      label: t("uploads.photoScan.label"),
      hint: t("uploads.photoScan.hint"),
      accept: "image/jpeg",
      pdfOnly: false,
      required: true,
    },
  ];

  if (applicantType === APPLICANT_NON_KANADA) {
    items.push({
      key: "permitScan",
      label: t("uploads.permitScan.label"),
      hint: t("uploads.permitScan.hint"),
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  if (categoryNeedsSponsorLetter(visaCategory)) {
    items.push({
      key: "formScan",
      label: t("uploads.formScan.label"),
      hint: t("uploads.formScan.hint"),
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  if (hasInvitationLetter) {
    items.push({
      key: "invitationLetterScan",
      label: t("uploads.invitationLetterScan.label"),
      hint: t("uploads.invitationLetterScan.hint"),
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  items.push({
    key: "otherIdScan",
    label: t("uploads.otherIdScan.label"),
    hint: t("uploads.otherIdScan.hint"),
    accept: ACCEPT,
    pdfOnly: true,
    required: false,
  });

  return items;
}

export function translateEnumLabel(
  t: TFunc,
  enumKey: "passportType" | "maritalStatus" | "purposeOfVisit" | "typeOfVisa" | "sex",
  value: string
) {
  if (!value) return value;
  try {
    return t(`enums.${enumKey}.${value}`);
  } catch {
    return value;
  }
}

export {
  TYPE_OF_VISA_REQUESTED,
  PASSPORT_TYPES,
  MARITAL_STATUSES,
  PURPOSE_OF_VISIT,
  VISA_CATEGORIES,
  APPLICANT_TYPES,
  CATEGORY_PURPOSE_MAP,
  CATEGORY_OTHERS_DEFAULT,
};
