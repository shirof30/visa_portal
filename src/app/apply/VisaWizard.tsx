"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProcessingOverlay from "@/components/ProcessingOverlay";

import TermsStep from "./steps/TermsStep";
import ApplicantTypeStep from "./steps/ApplicantTypeStep";
import VisaCategoryStep from "./steps/VisaCategoryStep";
import PurposeStep from "./steps/PurposeStep";
import PersonalStep from "./steps/PersonalStep";
import OtpStep from "./steps/OtpStep";
import PassportStep from "./steps/PassportStep";
import CanadaAddressStep from "./steps/CanadaAddressStep";
import OccupationStep from "./steps/OccupationStep";
import IndonesiaStayStep from "./steps/IndonesiaStayStep";
import SponsorStep from "./steps/SponsorStep";
import BackgroundStep from "./steps/BackgroundStep";
import UploadsStep from "./steps/UploadsStep";
import DeliveryMethodStep from "./steps/DeliveryMethodStep";
import ReviewStep from "./steps/ReviewStep";

import {
  APPLICANT_WN_KANADA,
  APPLICANT_NON_KANADA,
  categoryNeedsSponsorLetter,
  buildReason,
  getVisaUploads,
} from "./config/visaConfig";

// ─── Steps ───────────────────────────────────────────────────────────────────
type StepId =
  | "terms" | "applicant" | "category" | "purpose" | "personal" | "otp" | "passport"
  | "address" | "occupation" | "indonesia" | "sponsor" | "background" | "uploads" | "delivery" | "review";

const STEPS: { id: StepId; title: string }[] = [
  { id: "terms", title: "Terms & Conditions" },
  { id: "applicant", title: "Applicant Type" },
  { id: "category", title: "Visa Category" },
  { id: "purpose", title: "Purpose of Visit" },
  { id: "personal", title: "Personal Information" },
  { id: "passport", title: "Passport" },
  { id: "address", title: "Address in Canada" },
  { id: "otp", title: "Email Verification" },
  { id: "occupation", title: "Occupation" },
  { id: "indonesia", title: "Stay in Indonesia" },
  { id: "sponsor", title: "Sponsor" },
  { id: "background", title: "Background" },
  { id: "uploads", title: "Documents" },
  { id: "delivery", title: "How You'll Submit" },
  { id: "review", title: "Review & Submit" },
];

// ─── Form state — field names mirror the official Visa Application Form ─────
type Form = {
  // applicant + category + purpose
  applicantType: string;
  visaCategory: string;
  typeOfVisaRequested: string;
  purposeOfVisit: string;
  purposeOther: string;
  // personal
  firstName: string; middleName: string; familyName: string; sex: string;
  placeOfBirth: string; dateOfBirth: string; nationality: string; maritalStatus: string;
  // passport
  passportNumber: string; passportPlace: string; passportIssueDate: string;
  passportExpiryDate: string; passportType: string;
  // address (Canada) — section 13
  addressStreet: string; addressUnit: string; addressCity: string;
  addressProvince: string; addressPostalCode: string; addressCanadaCountry: string;
  addressCanadaFax: string; addressCanadaCell: string;
  phoneNumber: string; email: string;
  // occupation — section 14
  occupationEmployer: string; occupationPosition: string; occupationCompanyAddress: string;
  occupationCity: string; occupationProvincePostal: string; occupationCountry: string;
  occupationPhone: string; occupationFax: string;
  // Indonesia stay — sections 16-18
  intendedAddressIndonesia: string; intendedCityIndonesia: string; intendedPhone: string;
  portOfEntry: string; dateOfEntry: string; flightIn: string;
  portOfExit: string; dateOfExit: string; flightOut: string;
  hasInvitationLetter: boolean;
  // sponsor — section 19
  sponsorName: string; sponsorPosition: string; sponsorCompany: string;
  sponsorAddress: string; sponsorCityProvincePostal: string; sponsorPhone: string; sponsorFax: string;
  // background — section 20
  beenToIndonesiaBefore: string; indonesiaVisitDetails: string;
  hasOtherCountryVisa: string; otherVisaDetails: string;
  visaDenied: string; orderedToLeave: string; everArrested: string;
  // declaration / signature
  signatureName: string; signatureDate: string;
  // submission method
  submissionMethod: string; // "in_person" | "mail"
  // legal
  termsAccepted: boolean;
};

const INITIAL: Form = {
  applicantType: "", visaCategory: "", typeOfVisaRequested: "Single", purposeOfVisit: "", purposeOther: "",
  firstName: "", middleName: "", familyName: "", sex: "",
  placeOfBirth: "", dateOfBirth: "", nationality: "Canada", maritalStatus: "",
  passportNumber: "", passportPlace: "", passportIssueDate: "", passportExpiryDate: "",
  passportType: "Ordinary Passport",
  addressStreet: "", addressUnit: "", addressCity: "", addressProvince: "", addressPostalCode: "",
  addressCanadaCountry: "Canada", addressCanadaFax: "", addressCanadaCell: "",
  phoneNumber: "", email: "",
  occupationEmployer: "", occupationPosition: "", occupationCompanyAddress: "",
  occupationCity: "", occupationProvincePostal: "", occupationCountry: "",
  occupationPhone: "", occupationFax: "",
  intendedAddressIndonesia: "", intendedCityIndonesia: "", intendedPhone: "",
  portOfEntry: "", dateOfEntry: "", flightIn: "",
  portOfExit: "", dateOfExit: "", flightOut: "",
  hasInvitationLetter: false,
  sponsorName: "", sponsorPosition: "", sponsorCompany: "", sponsorAddress: "",
  sponsorCityProvincePostal: "", sponsorPhone: "", sponsorFax: "",
  beenToIndonesiaBefore: "No", indonesiaVisitDetails: "",
  hasOtherCountryVisa: "No", otherVisaDetails: "",
  visaDenied: "No", orderedToLeave: "No", everArrested: "No",
  signatureName: "", signatureDate: "",
  submissionMethod: "",
  termsAccepted: false,
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldCls(invalid: boolean, extra = "") {
  // 16px (text-base) is deliberate, not cosmetic: iOS Safari auto-zooms the
  // page on focus for any text input/select/textarea rendered under 16px,
  // which is what caused the "zooming in and out" on mobile. Do not drop
  // this back to text-sm.
  return `w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-1 bg-white ${
    invalid ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-red-500"
  } ${extra}`;
}

// Fields whose local Form key differs from the CanadaAddressStep's own prop names.
const ADDRESS_KEY_MAP: Record<string, keyof Form> = {
  addressCanadaStreet: "addressStreet",
  addressCanadaCity: "addressCity",
  addressCanadaProvince: "addressProvince",
  addressCanadaUnit: "addressUnit",
  addressCanadaPostalCode: "addressPostalCode",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function VisaWizard() {
  const router = useRouter();

  const [form, setForm] = useState<Form>(INITIAL);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [editFromReview, setEditFromReview] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailConfirmation, setMailConfirmation] = useState<{ ref: string } | null>(null);
  const [excludedNationalities, setExcludedNationalities] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config", { cache: "no-store" });
        if (res.ok) {
          const cfg = await res.json();
          if (Array.isArray(cfg.excludedNationalities)) setExcludedNationalities(cfg.excludedNationalities);
        }
      } catch {
        // Non-fatal — the dropdown just falls back to the full country list.
      }
    })();
  }, []);

  const step = STEPS[stepIndex];
  const REVIEW_INDEX = STEPS.findIndex((s) => s.id === "review");
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const sponsorRequired = form.hasInvitationLetter || categoryNeedsSponsorLetter(form.visaCategory);
  const uploadItems = useMemo(
    () => getVisaUploads(form.applicantType, form.hasInvitationLetter, form.visaCategory),
    [form.applicantType, form.hasInvitationLetter, form.visaCategory]
  );

  const inv = (cond: boolean) => attempted && cond;

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  const setField = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));
  const show = (v: any) => {
    const s = String(v ?? "").trim();
    return s ? s : "-";
  };

  function pickFile(key: string, raw: File | null) {
    if (!raw) {
      setFiles((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const allowed = ["application/pdf", "image/jpeg"];
    if (!allowed.includes(raw.type)) {
      setError("Only PDF or JPG/JPEG files are allowed.");
      return;
    }
    if (raw.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");
      return;
    }
    setError(null);
    setFiles((prev) => ({ ...prev, [key]: raw }));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const stepIsValid = useMemo(() => {
    switch (step.id) {
      case "terms":
        return form.termsAccepted;
      case "applicant":
        return !!form.applicantType;
      case "category":
        return !!form.visaCategory;
      case "purpose":
        return (
          !!form.purposeOfVisit &&
          (form.purposeOfVisit !== "Others" || !!form.purposeOther.trim())
        );
      case "personal":
        return (
          !!form.firstName.trim() &&
          !!form.familyName.trim() &&
          !!form.sex &&
          !!form.placeOfBirth.trim() &&
          !!form.dateOfBirth &&
          !!form.nationality.trim()
        );
      case "otp":
        return otpVerified;
      case "passport":
        return (
          !!form.passportNumber.trim() &&
          !!form.passportPlace.trim() &&
          !!form.passportIssueDate &&
          !!form.passportExpiryDate
        );
      case "address":
        return (
          !!form.addressStreet.trim() &&
          !!form.addressCity.trim() &&
          !!form.addressProvince.trim() &&
          !!form.addressPostalCode.trim() &&
          form.phoneNumber.replace(/\D/g, "").length === 10 &&
          !!form.email.trim() &&
          emailRe.test(form.email)
        );
      case "occupation":
        return true;
      case "indonesia":
        return true;
      case "sponsor":
        if (!sponsorRequired) return true;
        return (
          !!form.sponsorName.trim() &&
          !!form.sponsorCompany.trim() &&
          !!form.sponsorPhone.trim() &&
          !!form.sponsorAddress.trim()
        );
      case "background":
        return true;
      case "uploads":
        return uploadItems.filter((x) => x.required).every((x) => !!files[x.key]);
      case "delivery":
        return !!form.submissionMethod;
      case "review":
        return !!form.signatureName.trim() && !!form.signatureDate;
      default:
        return true;
    }
  }, [step.id, form, files, otpVerified, sponsorRequired, uploadItems]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  function scrollTop() {
    // On iOS Safari, if an input still has focus (keyboard open) when we
    // navigate steps, the visual viewport stays shifted by the keyboard
    // height and window.scrollTo runs against stale layout — that's what
    // left people stranded near the bottom after tapping Continue. Blur
    // first to close the keyboard, then wait two frames for React to
    // finish rendering the new (usually shorter) step and the keyboard
    // to finish closing before scrolling. Plain jump, not smooth — a
    // smooth scroll racing the keyboard-close animation is what caused
    // the janky zoom/settle behavior too.
    (document.activeElement as HTMLElement | null)?.blur();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });
  }
  function goToReview() {
    setError(null); setAttempted(false); setEditFromReview(false);
    setStepIndex(REVIEW_INDEX); scrollTop();
  }
  function goNext() {
    setError(null); setAttempted(false);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    scrollTop();
  }
  function goBack() {
    setError(null); setAttempted(false);
    setStepIndex((i) => Math.max(i - 1, 0));
    scrollTop();
  }
  function jumpToStep(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    if (index > stepIndex && !stepIsValid) {
      setAttempted(true);
      setError("Please complete this step before continuing.");
      return;
    }
    setError(null); setAttempted(false); setEditFromReview(false);
    setStepIndex(index); scrollTop();
  }
  function handleEditStep(targetStepId: string) {
    const idx = STEPS.findIndex((s) => s.id === targetStepId);
    if (idx < 0) return;
    setError(null); setAttempted(false); setEditFromReview(true);
    setStepIndex(idx); scrollTop();
  }
  function handleNextClick() {
    setError(null);
    if (!stepIsValid) {
      setAttempted(true);
      setError("Please complete all fields marked in red below.");
      return;
    }
    setAttempted(false);
    if (editFromReview) { goToReview(); return; }
    goNext();
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!stepIsValid) {
      setAttempted(true);
      setError("Please sign and date the declaration before submitting.");
      return;
    }
    setError(null); setLoading(true);
    try {
      const phoneDigits = form.phoneNumber.replace(/\D/g, "").slice(0, 10);
      const fullName = [form.firstName, form.middleName, form.familyName].filter(Boolean).join(" ");
      const canadaStreet = [form.addressUnit.trim(), form.addressStreet.trim()].filter(Boolean).join(", ");

      const fd = new FormData();
      // identity
      fd.append("fullName", fullName);
      fd.append("aliasName", "");
      fd.append("gender", form.sex === "Male" ? "Laki-laki" : form.sex === "Female" ? "Perempuan" : "");
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("birthCity", form.placeOfBirth);
      fd.append("birthCountry", "");
      fd.append("nationality", form.nationality);
      fd.append("religion", "");
      fd.append("birthCertIssuedIn", "");
      fd.append("registrationId", ""); // no LD for visa applicants
      fd.append("firstName", form.firstName);
      fd.append("middleName", form.middleName);
      fd.append("familyName", form.familyName);
      // passport
      fd.append("passportId", form.passportNumber);
      fd.append("passportIssueDate", form.passportIssueDate);
      fd.append("passportExpiryDate", form.passportExpiryDate);
      fd.append("oldPassportNumber", "");
      fd.append("oldPassportIssueDate", "");
      fd.append("oldPassportExpiryDate", "");
      fd.append("oldPassportIssuer", form.passportPlace);
      fd.append("previousPassportStatus", "still_valid");
      fd.append("passportPlaceOfIssuance", form.passportPlace);
      fd.append("passportType", form.passportType);
      // civil docs (n/a)
      fd.append("ktpNumber", "");
      fd.append("ktpIssueDate", "");
      fd.append("birthCertNumber", "");
      // addresses — Canada (section 13)
      fd.append("addressCanadaStreet", canadaStreet);
      fd.append("addressCanadaCity", form.addressCity);
      fd.append("addressCanadaProvince", form.addressProvince);
      fd.append("addressCanadaPostalCode", form.addressPostalCode);
      fd.append("addressCanadaCountry", form.addressCanadaCountry);
      fd.append("addressCanadaFax", form.addressCanadaFax);
      fd.append("addressCanadaCell", form.addressCanadaCell);
      // addresses — Indonesia (section 16)
      fd.append("addressIndonesiaStreet", form.intendedAddressIndonesia);
      fd.append("addressIndonesiaCity", form.intendedCityIndonesia);
      fd.append("addressIndonesiaProvince", "");
      fd.append("addressIndonesiaDistrict", "");
      fd.append("addressIndonesiaPostalCode", "");
      fd.append("addressIndonesiaPhone", form.intendedPhone);
      // contact
      fd.append("phoneNumber", phoneDigits);
      fd.append("email", form.email);
      // status / employment (section 14)
      fd.append("maritalStatus", form.maritalStatus);
      fd.append("occupation", form.occupationPosition);
      fd.append("workplace", form.occupationEmployer);
      fd.append("workplaceAddress", form.occupationCompanyAddress);
      fd.append("occupationPosition", form.occupationPosition);
      fd.append("occupationCompanyAddress", form.occupationCompanyAddress);
      fd.append("occupationCity", form.occupationCity);
      fd.append("occupationProvincePostal", form.occupationProvincePostal);
      fd.append("occupationCountry", form.occupationCountry);
      fd.append("occupationPhone", form.occupationPhone);
      fd.append("occupationFax", form.occupationFax);
      fd.append("stayStatus", form.applicantType === APPLICANT_WN_KANADA ? "WN Kanada" : "Non-Kanada");
      // parents / spouse (n/a for visa)
      ["fatherName","fatherBirthPlace","fatherBirthDate","fatherNationality","fatherAddress",
       "motherName","motherBirthPlace","motherBirthDate","motherNationality","motherAddress",
       "spouseName","spouseBirthPlace","spouseBirthDate","spouseNationality","spouseAddress"]
        .forEach((k) => fd.append(k, ""));
      // emergency / sponsor → section 19
      fd.append("emergencyCanadaName", "");
      fd.append("emergencyCanadaAddress", "");
      fd.append("emergencyCanadaPhone", "");
      fd.append("emergencyCanadaRelation", "");
      fd.append("emergencyIndonesiaName", form.sponsorName);
      fd.append("emergencyIndonesiaAddress", form.sponsorAddress);
      fd.append("emergencyIndonesiaPhone", form.sponsorPhone);
      fd.append("emergencyIndonesiaRelation", form.sponsorPosition || (form.sponsorName ? "Sponsor" : ""));
      fd.append("sponsorCompany", form.sponsorCompany);
      fd.append("sponsorCityProvincePostal", form.sponsorCityProvincePostal);
      fd.append("sponsorFax", form.sponsorFax);
      // flight / vessel (section 17) + invitation letter (section 18)
      fd.append("flightPortOfEntry", form.portOfEntry);
      fd.append("flightDateOfEntry", form.dateOfEntry);
      fd.append("flightNoEntry", form.flightIn);
      fd.append("flightPortOfExit", form.portOfExit);
      fd.append("flightDateOfExit", form.dateOfExit);
      fd.append("flightNoExit", form.flightOut);
      fd.append("hasInvitationLetter", form.hasInvitationLetter ? "true" : "false");
      // background (section 20)
      fd.append("everBeenToIndonesia", form.beenToIndonesiaBefore === "Yes" ? "true" : "false");
      fd.append("indonesiaVisitDetails", form.indonesiaVisitDetails);
      fd.append("hasOtherValidVisa", form.hasOtherCountryVisa === "Yes" ? "true" : "false");
      fd.append("otherVisaCountry", form.otherVisaDetails);
      fd.append("visaEverDenied", form.visaDenied === "Yes" ? "true" : "false");
      fd.append("everOrderedToLeave", form.orderedToLeave === "Yes" ? "true" : "false");
      fd.append("everArrestedConvicted", form.everArrested === "Yes" ? "true" : "false");
      // visa type / purpose (top of form + section 15)
      fd.append("typeOfVisaRequested", form.typeOfVisaRequested);
      fd.append("visaCategory", form.visaCategory);
      fd.append("purposeOfVisit", form.purposeOfVisit);
      fd.append("purposeOfVisitOther", form.purposeOther);
      // declaration / signature
      fd.append("signatureName", form.signatureName);
      fd.append("signatureDate", form.signatureDate);
      // submission method
      fd.append("submissionMethod", form.submissionMethod);
      // service
      fd.append("isChildPassportRequest", "false");
      fd.append("reason", buildReason(form.typeOfVisaRequested, form.purposeOfVisit, form.purposeOther));
      fd.append("disclaimerAccepted", form.termsAccepted ? "true" : "false");
      fd.append("portalType", "visa");

      // files
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      if (!res.ok) {
        let detail = "Please try again.";
        try {
          const j = await res.json();
          if (j?.error) detail = j.error;
        } catch {}
        setError(`Failed to submit application: ${detail}`);
        setLoading(false);
        return;
      }
      const created = await res.json();
      if (form.submissionMethod === "mail") {
        setMailConfirmation({ ref: created.applicationRef as string });
        setLoading(false);
      } else {
        router.push(`/appointment?id=${created.id}`);
      }
    } catch (e: any) {
      setError(`Failed to submit application: ${e?.message ?? "Network error"}`);
      setLoading(false);
    }
  }

  // Extended handleChange for the Address step: routes CanadaAddressStep's own
  // prop names onto the wizard's Form keys (some map 1:1, some are renamed).
  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const mapped = ADDRESS_KEY_MAP[name] ?? (name as keyof Form);
    setForm((p) => ({ ...p, [mapped]: value }));
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (mailConfirmation) {
    return (
      <div className="py-10">
        <div className="mx-auto max-w-lg px-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">KJRI Vancouver</p>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 mb-2">Application Submitted</h1>
            <p className="text-sm text-gray-600 mb-6">
              Thank you. Your application has been received — no appointment is needed since
              you're mailing your documents.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Application Reference</p>
              <p className="font-mono text-lg font-bold text-gray-900">{mailConfirmation.ref}</p>
              <p className="text-xs text-gray-500 mt-1">Keep this number — you'll need it to check your status.</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">Mail your documents to</p>
              <p className="text-sm text-amber-900 leading-relaxed">
                Consulate General of the Republic of Indonesia<br />
                1630 Alberni St<br />
                Vancouver, BC V6G 1A6<br />
                Canada
              </p>
              <p className="text-xs text-amber-800 mt-2">
                Please include a copy of this reference number with your documents, and a
                prepaid return envelope or shipping label if you'd like your passport/visa
                mailed back to you.
              </p>
            </div>

            <a
              href="/check"
              className="inline-block w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition"
            >
              Check Application Status
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 pb-28">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">
                KJRI Vancouver
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Indonesian Visa Application
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                This form collects exactly what the official Visa Application Form requires, so it
                can be auto-filled and downloaded once your application is submitted.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Something needs your attention</p>
                <p className="mt-1 text-red-700/90">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-sm" noValidate>
              {/* Step header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500">
                    Step {stepIndex + 1} of {STEPS.length}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900">{step.title}</h2>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {STEPS.map((s, i) => {
                    const active = i === stepIndex, done = i < stepIndex;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => jumpToStep(i)}
                        title={`Step ${i + 1}: ${s.title}`}
                        className={[
                          "h-2.5 w-2.5 rounded-full border transition cursor-pointer",
                          active
                            ? "bg-red-600 border-red-600 scale-110"
                            : done
                            ? "bg-gray-900 border-gray-900 hover:bg-gray-700"
                            : "bg-white border-gray-300 hover:border-gray-400",
                        ].join(" ")}
                      />
                    );
                  })}
                </div>
              </div>

              {step.id === "terms" && (
                <TermsStep
                  accepted={form.termsAccepted}
                  setAccepted={(v) => setForm((p) => ({ ...p, termsAccepted: v }))}
                  showError={inv(!form.termsAccepted)}
                />
              )}

              {step.id === "applicant" && (
                <ApplicantTypeStep
                  value={form.applicantType}
                  onSelect={(v) =>
                    setForm((p) => ({
                      ...p,
                      applicantType: v,
                      nationality:
                        v === APPLICANT_WN_KANADA
                          ? "Canada"
                          : p.nationality === "Canada"
                          ? ""
                          : p.nationality,
                    }))
                  }
                  showError={inv(!form.applicantType)}
                />
              )}

              {step.id === "category" && (
                <VisaCategoryStep
                  value={form.visaCategory}
                  onSelect={(categoryCode) => setForm((p) => ({ ...p, visaCategory: categoryCode }))}
                  showError={inv(!form.visaCategory)}
                />
              )}

              {step.id === "purpose" && (
                <PurposeStep
                  form={form}
                  inv={inv}
                  fieldCls={fieldCls}
                  onSelectPurpose={(purpose) => setForm((p) => ({ ...p, purposeOfVisit: purpose, purposeOther: "" }))}
                  onChangePurposeOther={(v) => setForm((p) => ({ ...p, purposeOther: v }))}
                />
              )}

              {step.id === "personal" && (
                <PersonalStep
                  form={form}
                  todayStr={todayStr}
                  inv={inv}
                  fieldCls={fieldCls}
                  handleChange={handleChange}
                  excludedNationalities={excludedNationalities}
                />
              )}

              {step.id === "otp" && (
                otpVerified ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm">
                    <p className="font-semibold text-green-700">✓ Email verified</p>
                    <p className="mt-1 text-green-700/90">
                      {form.email} has been verified. Click Continue to proceed.
                    </p>
                  </div>
                ) : (
                  <OtpStep
                    phoneNumber={form.phoneNumber.replace(/\D/g, "")}
                    email={form.email}
                    onVerified={() => {
                      setOtpVerified(true);
                      if (!editFromReview) goNext();
                    }}
                  />
                )
              )}

              {step.id === "passport" && (
                <PassportStep
                  form={form}
                  todayStr={todayStr}
                  inv={inv}
                  fieldCls={fieldCls}
                  handleChange={handleChange}
                />
              )}

              {step.id === "address" && (
                <CanadaAddressStep
                  form={{
                    addressCanadaStreet: form.addressStreet,
                    addressCanadaCity: form.addressCity,
                    addressCanadaProvince: form.addressProvince,
                    addressCanadaUnit: form.addressUnit,
                    addressCanadaPostalCode: form.addressPostalCode,
                    addressCanadaCountry: form.addressCanadaCountry,
                    addressCanadaFax: form.addressCanadaFax,
                    addressCanadaCell: form.addressCanadaCell,
                    phoneNumber: form.phoneNumber,
                    email: form.email,
                  }}
                  inv={inv}
                  fieldCls={fieldCls}
                  handleChange={handleAddressChange}
                  setForm={(updater: any) =>
                    setForm((prev) => {
                      const mapped =
                        typeof updater === "function"
                          ? updater({
                              addressCanadaStreet: prev.addressStreet,
                              addressCanadaCity: prev.addressCity,
                              addressCanadaProvince: prev.addressProvince,
                              addressCanadaUnit: prev.addressUnit,
                              addressCanadaPostalCode: prev.addressPostalCode,
                            })
                          : updater;
                      return {
                        ...prev,
                        addressStreet: mapped.addressCanadaStreet ?? prev.addressStreet,
                        addressCity: mapped.addressCanadaCity ?? prev.addressCity,
                        addressProvince: mapped.addressCanadaProvince ?? prev.addressProvince,
                        addressUnit: mapped.addressCanadaUnit ?? prev.addressUnit,
                        addressPostalCode: mapped.addressCanadaPostalCode ?? prev.addressPostalCode,
                      };
                    })
                  }
                />
              )}

              {step.id === "occupation" && (
                <OccupationStep form={form} fieldCls={fieldCls} handleChange={handleChange} />
              )}

              {step.id === "indonesia" && (
                <IndonesiaStayStep
                  form={form}
                  fieldCls={fieldCls}
                  handleChange={handleChange}
                  todayStr={todayStr}
                  hasInvitationLetter={form.hasInvitationLetter}
                  onToggleInvitationLetter={(v) => setForm((p) => ({ ...p, hasInvitationLetter: v }))}
                />
              )}

              {step.id === "sponsor" && (
                <SponsorStep
                  form={form}
                  required={sponsorRequired}
                  inv={inv}
                  fieldCls={fieldCls}
                  handleChange={handleChange}
                />
              )}

              {step.id === "background" && (
                <BackgroundStep form={form} fieldCls={fieldCls} setField={setField as any} />
              )}

              {step.id === "uploads" && (
                <UploadsStep
                  items={uploadItems}
                  files={files}
                  invMissing={(required, key) => inv(required && !files[key])}
                  onPick={(key, raw) => pickFile(key, raw)}
                />
              )}

              {step.id === "delivery" && (
                <DeliveryMethodStep
                  value={form.submissionMethod}
                  onSelect={(v) => setForm((p) => ({ ...p, submissionMethod: v }))}
                  showError={inv(!form.submissionMethod)}
                />
              )}

              {step.id === "review" && (
                <ReviewStep
                  form={form}
                  files={files}
                  uploadItems={uploadItems}
                  show={show}
                  onEdit={handleEditStep}
                  inv={inv}
                  fieldCls={fieldCls}
                  handleChange={handleChange}
                  todayStr={todayStr}
                />
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { if (editFromReview) { goToReview(); return; } goBack(); }}
                  disabled={(stepIndex === 0 && !editFromReview) || loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editFromReview ? "Back to Review" : "Back"}
                </button>

                {step.id !== "review" ? (
                  step.id !== "otp" && (
                    <button
                      type="button"
                      onClick={handleNextClick}
                      disabled={loading}
                      className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {editFromReview ? "Save" : "Continue"}
                    </button>
                  )
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || !stepIsValid}
                    className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting…" : "Submit Application"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky progress bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/80 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900">Application progress</p>
              <p className="text-[11px] text-gray-500 truncate">
                {step.title} • Step {stepIndex + 1} of {STEPS.length}
              </p>
            </div>
            <div className="ml-auto w-48">
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span>Complete</span>
                <span className="font-semibold text-gray-700">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-red-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProcessingOverlay
        open={loading && step.id === "review"}
        title="Processing…"
        subtitle="Please wait and do not close this page."
        steps={[
          "Uploading your application data",
          "Scanning files for viruses",
          "Saving documents and generating your application number",
          "Preparing your confirmation",
        ]}
      />
    </div>
  );
}
