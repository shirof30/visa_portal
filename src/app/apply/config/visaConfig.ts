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
// STEP 1 of "Visa Type & Purpose": Visa Category — "Jenis Visa berdasarkan
// Tujuan Kunjungan" (visa category by purpose of visit). This is the
// consulate's own classification, shown to the applicant with an explanation
// before they pick a specific visa product below. Each sub-item maps onto a
// value from PURPOSE_OF_VISIT so the official PDF export keeps working.
// ─────────────────────────────────────────────────────────────────────────────
export type VisaCategoryOption = {
  purpose: (typeof PURPOSE_OF_VISIT)[number];
  otherLabel?: string; // used when purpose === "Others" to prefill the specify text
};

export type VisaCategory = {
  code: string; // "C1".."C5" or "TRANSIT"
  title: string;
  titleId: string; // original Indonesian title, shown as a subtitle for reference
  options: { label: string; value: VisaCategoryOption }[];
};

export const VISA_CATEGORIES: VisaCategory[] = [
  {
    code: "C1",
    title: "Personal Visit",
    titleId: "Wisata / Berobat / Kunjungan Keluarga",
    options: [
      { label: "Tourism", value: { purpose: "Tourism" } },
      { label: "Medical Treatment", value: { purpose: "Others", otherLabel: "Medical Treatment" } },
      { label: "Family Visit", value: { purpose: "Family Visit" } },
    ],
  },
  {
    code: "C2",
    title: "Business Visit",
    titleId: "Bisnis / Rapat / Pembelian Barang",
    options: [
      { label: "Business", value: { purpose: "Commercial/Business" } },
      { label: "Meeting", value: { purpose: "Conference/Seminar/Workshop" } },
      { label: "Goods Purchase", value: { purpose: "Others", otherLabel: "Goods Purchase" } },
    ],
  },
  {
    code: "C3",
    title: "Medical Care",
    titleId: "Pengobatan",
    options: [
      { label: "Medical Care", value: { purpose: "Others", otherLabel: "Medical Care" } },
    ],
  },
  {
    code: "C4",
    title: "Official Government Duty",
    titleId: "Tugas Pemerintah Resmi",
    options: [
      { label: "Official Government Duty", value: { purpose: "Others", otherLabel: "Official Government Duty" } },
    ],
  },
  {
    code: "C5",
    title: "Journalism",
    titleId: "Jurnalistik",
    options: [
      { label: "Journalism", value: { purpose: "Press and Media" } },
    ],
  },
  {
    code: "TRANSIT",
    title: "Transit",
    titleId: "Transit melalui Indonesia",
    options: [
      { label: "Transit through Indonesia", value: { purpose: "Others", otherLabel: "Transit" } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 of "Visa Type & Purpose": the actual visa product offered through
// this portal (mirrors the "Visa Types Available" panel on the main site).
// `entryType` maps onto the official PDF form's "Type of Visa Requested"
// checkbox (Transit / Single / Limited/Temporary Stay / Multiple) — B211A/B/C
// are all single-entry visit visas in practice, so they resolve to "Single".
// ─────────────────────────────────────────────────────────────────────────────
export type VisaProduct = {
  code: "B211A" | "B211B" | "B211C" | "C316";
  label: string;
  subtitle: string;
  entryType: (typeof TYPE_OF_VISA_REQUESTED)[number];
  suggestedFor: string[]; // VisaCategory codes this product is typically suggested for
};

export const VISA_PRODUCTS: VisaProduct[] = [
  { code: "B211A", label: "Tourist Visa", subtitle: "Tourism / Family Visit", entryType: "Single", suggestedFor: ["C1", "C3"] },
  { code: "B211B", label: "Business Visa", subtitle: "Commercial / Conference", entryType: "Single", suggestedFor: ["C2", "C4"] },
  { code: "B211C", label: "Social Visa", subtitle: "Arts / Sports / Study", entryType: "Single", suggestedFor: ["C5"] },
  { code: "C316", label: "Transit Visa", subtitle: "Transit through Indonesia", entryType: "Transit", suggestedFor: ["TRANSIT"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the free-text "reason" string stored on the submission (used by admin/email). */
export function buildReason(visaProductLabel: string, purpose: string, purposeOther: string) {
  const purposeLabel = purpose === "Others" && purposeOther ? purposeOther : purpose;
  return `${purposeLabel}${visaProductLabel ? ` — ${visaProductLabel}` : ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document requirements. Base set matches what the form implies (passport,
// photo, and — per section 18 — a copy of any Invitation/Reference letter),
// plus one diagram-driven addition:
//   • Non-Kanada → proof of legal stay in Canada (permitScan)
// Keys map onto the shared `submissions` backend fields.
// ─────────────────────────────────────────────────────────────────────────────
const ACCEPT = "application/pdf,image/jpeg,image/jpg";

export function getVisaUploads(applicantType: string, hasInvitationLetter: boolean): UploadItem[] {
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
