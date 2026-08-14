import type { UploadItem } from "../ui/UploadRow";

// ─────────────────────────────────────────────────────────────────────────────
// Applicant type — WN Kanada / Non-Kanada. Not a field on the official Visa
// Application Form itself, but kept as an internal branch (per the AURORA flow
// diagram) because it drives one conditional document: proof of legal stay in
// Canada for non-Canadians.
// ─────────────────────────────────────────────────────────────────────────────
export const APPLICANT_WN_KANADA = "WN_KANADA";
export const APPLICANT_NON_KANADA = "NON_KANADA";

export const APPLICANT_TYPES = [
  {
    value: APPLICANT_WN_KANADA,
    label: "Canadian Citizen",
    sub: "WN Kanada",
    hint: "You hold a Canadian passport / Canadian citizenship.",
  },
  {
    value: APPLICANT_NON_KANADA,
    label: "Non-Canadian",
    sub: "Non-Kanada",
    hint: "You are not a Canadian citizen but currently reside in Canada (study / work / PR / visitor).",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// STEP: Visa Category — "Jenis Visa berdasarkan Tujuan Kunjungan" (C1–C5).
// This is the consulate's own classification of visa purpose, asked first,
// before the official form's own "Type of Visa Requested" / "Purpose of
// visit" multiple choice. It also drives one document requirement: C2–C5
// need a sponsor/guarantor letter from Indonesia (see getVisaUploads below).
// ─────────────────────────────────────────────────────────────────────────────
export type VisaCategory = {
  code: "C1" | "C2" | "C3" | "C4" | "C5";
  title: string;
  items: string[]; // English
  itemsId: string; // Indonesian, shown as reference
};

export const VISA_CATEGORIES: VisaCategory[] = [
  {
    code: "C1",
    title: "Personal Visit",
    items: ["Tourism", "Medical Treatment", "Family Visit"],
    itemsId: "Wisata / Kunjungan Keluarga",
  },
  {
    code: "C2",
    title: "Business Visit",
    items: ["Business", "Meeting", "Goods Purchase"],
    itemsId: "Bisnis / Rapat / Pembelian Barang",
  },
  {
    code: "C3",
    title: "Medical Care",
    items: ["Medical Care"],
    itemsId: "Pengobatan",
  },
  {
    code: "C4",
    title: "Official Government Duty",
    items: ["Official Government Duty"],
    itemsId: "Tugas Pemerintah Resmi",
  },
  {
    code: "C5",
    title: "Journalism",
    items: ["Journalism"],
    itemsId: "Jurnalistik",
  },
];

/** C2–C5 require a sponsor/guarantor letter from Indonesia; C1 does not. */
export function categoryNeedsSponsorLetter(categoryCode: string): boolean {
  return categoryCode === "C2" || categoryCode === "C3" || categoryCode === "C4" || categoryCode === "C5";
}

// ─────────────────────────────────────────────────────────────────────────────
// Which "Purpose of visit" checkboxes (from the official form's flat list,
// see PURPOSE_OF_VISIT below) are relevant to each C1–C5 category. Derived
// directly from each category's own `items` above — e.g. C1 covers
// Tourism/Medical Treatment/Family Visit, and since the official form has no
// distinct "Medical Treatment" checkbox, that maps onto "Others" (with the
// specify field). Categories with only one sensible match (C3, C4, C5) still
// show as a single filtered option rather than being auto-selected, so the
// applicant always makes an explicit choice.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_PURPOSE_MAP: Record<string, string[]> = {
  C1: ["Tourism", "Family Visit", "Others"],
  C2: ["Commercial/Business", "Conference/Seminar/Workshop", "Others"],
  C3: ["Others"],
  C4: ["Others"],
  C5: ["Press and Media"],
};

// ─────────────────────────────────────────────────────────────────────────────
// When "Others" is the (only, or one of the) purpose option(s) for a category,
// pre-fill the specify field with what that category's "Others" actually
// means — e.g. C1's Others stands in for "Medical Treatment" (Berobat), since
// the official form has no dedicated checkbox for it. Kept in English
// deliberately, regardless of UI locale: this value is submitted as-is onto
// the English-language official government form, not just displayed in the
// app. The applicant can still edit it before continuing.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_OTHERS_DEFAULT: Record<string, string> = {
  C1: "Medical Treatment",
  C2: "Goods Purchase",
  C3: "Medical Care",
  C4: "Official Government Duty",
};

// ─────────────────────────────────────────────────────────────────────────────
// Fields below mirror the official KJRI "VISA APPLICATION FORM" exactly —
// same option lists, same order, same wording — so submissions map 1:1 onto
// the printable/fillable PDF (see /api/submissions/[id]/export-pdf).
// ─────────────────────────────────────────────────────────────────────────────

// "Type of Visa Requested (choose one)" — top of page 1
export const TYPE_OF_VISA_REQUESTED = ["Transit", "Single", "Limited/Temporary Stay", "Multiple"] as const;

// "11. Type of Passport (choose one)"
export const PASSPORT_TYPES = ["Ordinary Passport", "Diplomatic Passport", "Service Passport"] as const;

// "12. Marital Status"
export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"] as const;

// "15. Purpose of visit to Indonesia (choose one, per the nature of your visit)"
export const PURPOSE_OF_VISIT = [
  "Tourism",
  "Study",
  "Conference/Seminar/Workshop",
  "Arts",
  "Family Visit",
  "Commercial/Business",
  "Industrial/Mining",
  "Sports",
  "Press and Media",
  "Others",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the free-text "reason" string stored on the submission (used by admin/email). */
export function buildReason(typeOfVisa: string, purpose: string, purposeOther: string) {
  const purposeLabel = purpose === "Others" && purposeOther ? purposeOther : purpose;
  return `${purposeLabel}${typeOfVisa ? ` — ${typeOfVisa} Visa` : ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document requirements.
//   • Non-Kanada → proof of legal stay in Canada (permitScan)
//   • C2–C5      → sponsor/guarantor letter from Indonesia (formScan)
//   • Invitation/Reference letter (form section 18) → copy of that letter
// Keys map onto the shared `submissions` backend fields.
// ─────────────────────────────────────────────────────────────────────────────
const ACCEPT = "application/pdf,image/jpeg,image/jpg";

export function getVisaUploads(applicantType: string, hasInvitationLetter: boolean, visaCategory: string): UploadItem[] {
  const items: UploadItem[] = [
    {
      key: "passportScan",
      label: "Passport (identity page)",
      hint: "Bio-data page with your photo. Passport must be valid at least 6 months.",
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    },
    {
      key: "photoScan",
      label: "Passport-style photo",
      hint: "Recent photo, 40mm × 60mm, plain background (matches the photo box on the printed form).",
      accept: "image/jpeg",
      pdfOnly: false,
      required: true,
    },
  ];

  // Non-Canadian applicants must prove legal residence in Canada.
  if (applicantType === APPLICANT_NON_KANADA) {
    items.push({
      key: "permitScan",
      label: "Canada residence permit / status document",
      hint: "Study Permit / Work Permit / PR card / Visitor Record proving your legal stay in Canada.",
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  // Visa category C2–C5 requires a sponsor/guarantor letter from Indonesia.
  if (categoryNeedsSponsorLetter(visaCategory)) {
    items.push({
      key: "formScan",
      label: "Sponsor / Guarantor Letter",
      hint: "Required for your selected visa category — a sponsor or guarantor letter from Indonesia.",
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  // Form section 18: "if yes, please submit a copy with the application."
  if (hasInvitationLetter) {
    items.push({
      key: "invitationLetterScan",
      label: "Invitation / Reference letter",
      hint: "Copy of the invitation or reference letter you indicated you have.",
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  // Optional supporting document for everyone.
  items.push({
    key: "otherIdScan",
    label: "Supporting document (optional)",
    hint: "Return flight ticket, hotel booking, bank statement, sponsor letter, etc.",
    accept: ACCEPT,
    pdfOnly: true,
    required: false,
  });

  return items;
}
