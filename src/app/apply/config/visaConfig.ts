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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the free-text "reason" string stored on the submission (used by admin/email). */
export function buildReason(typeOfVisa: string, purpose: string, purposeOther: string) {
  const purposeLabel = purpose === "Others" && purposeOther ? purposeOther : purpose;
  return `${purposeLabel}${typeOfVisa ? ` — ${typeOfVisa} Visa` : ""}`;
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
