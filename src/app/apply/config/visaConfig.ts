import type { UploadItem } from "../ui/UploadRow";

// ─────────────────────────────────────────────────────────────────────────────
// Applicant type — the top-level branch from the flow diagram (WN Kanada / Non-Kanada)
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
// Visa categories by purpose of visit (Jenis Visa berdasarkan Tujuan Kunjungan)
// Taken directly from the AURORA visa flow diagram.
// ─────────────────────────────────────────────────────────────────────────────
export type VisaCategory = {
  code: "C1" | "C2" | "C3" | "C4" | "C5";
  title: string;
  purposes: string[];
};

export const VISA_CATEGORIES: VisaCategory[] = [
  { code: "C1", title: "Tourism, Medical & Family", purposes: ["Tourism", "Medical Treatment", "Family Visit"] },
  { code: "C2", title: "Business", purposes: ["Business", "Meeting", "Goods Purchase"] },
  { code: "C3", title: "Medical Care", purposes: ["Medical Care"] },
  { code: "C4", title: "Official Government Duty", purposes: ["Official Government Duty"] },
  { code: "C5", title: "Journalistic", purposes: ["Journalistic"] },
];

export const VISA_TYPES = [
  "Single Entry",
  "Multiple Entry",
  "Transit",
  "Limited Stay (Temporary)",
] as const;

export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"] as const;
export const PASSPORT_TYPES = [
  "Ordinary Passport",
  "Official Passport",
  "Diplomatic Passport",
  "Special Passport",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** All categories except C1 require a sponsor/guarantor from Indonesia (per diagram: C2–C5). */
export function categoryNeedsSponsor(code: string): boolean {
  return code === "C2" || code === "C3" || code === "C4" || code === "C5";
}

/** Resolve the full "reason" string stored on the submission. */
export function buildReason(categoryCode: string, purpose: string, visaType: string, purposeOther: string) {
  const purposeLabel = purpose === "Others" && purposeOther ? purposeOther : purpose;
  return `${categoryCode} — ${purposeLabel}${visaType ? ` (${visaType})` : ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conditional document requirements (Upload Dokumen Persyaratan)
// Base for everyone, plus:
//   • Non-Kanada  → Canada residence permit (permitScan)          [diagram note]
//   • C2–C5       → Sponsor/Guarantor letter from Indonesia (formScan) [diagram note]
// Keys map onto the existing shared `submissions` backend fields — no schema change.
// ─────────────────────────────────────────────────────────────────────────────
const ACCEPT = "application/pdf,image/jpeg,image/jpg";

export function getVisaUploads(applicantType: string, categoryCode: string): UploadItem[] {
  const items: UploadItem[] = [
    {
      key: "passportScan",
      label: "Passport (identity page)",
      hint: "Bio-data page with your photo. Passport must be valid at least 6 months.",
      accept: ACCEPT,
      pdfOnly: true,
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

  // C2–C5 require a sponsor / guarantor letter from Indonesia.
  if (categoryNeedsSponsor(categoryCode)) {
    items.push({
      key: "formScan",
      label: "Sponsor / Guarantor letter from Indonesia",
      hint: "Required for Business, Medical Care, Official Duty, and Journalistic categories (C2–C5).",
      accept: ACCEPT,
      pdfOnly: true,
      required: true,
    });
  }

  // Optional supporting document for everyone.
  items.push({
    key: "otherIdScan",
    label: "Supporting document (optional)",
    hint: "Return flight ticket, hotel booking, bank statement, invitation letter, etc.",
    accept: ACCEPT,
    pdfOnly: true,
    required: false,
  });

  return items;
}
