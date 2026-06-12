"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
type StepId = "personal" | "passport" | "address" | "purpose" | "indonesia" | "sponsor" | "questions" | "uploads" | "review";

const STEPS: { id: StepId; title: string }[] = [
  { id: "personal",  title: "Personal Info" },
  { id: "passport",  title: "Passport" },
  { id: "address",   title: "Canada Address" },
  { id: "purpose",   title: "Purpose" },
  { id: "indonesia", title: "Indonesia Stay" },
  { id: "sponsor",   title: "Sponsor" },
  { id: "questions", title: "Background" },
  { id: "uploads",   title: "Documents" },
  { id: "review",    title: "Review" },
];

const VISA_TYPES = ["Transit", "Single Entry", "Multiple Entry", "Limited/Temporary Stay"];
const PURPOSES = ["Tourism", "Study", "Conference / Seminar / Workshop", "Arts", "Family Visit", "Commercial / Business", "Industrial / Mining", "Sports", "Press and Media", "Others"];
const PASSPORT_TYPES = ["Ordinary Passport", "Official Passport", "Diplomatic Passport", "Special Passport"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

type Form = {
  // 1. Personal
  firstName: string; middleName: string; familyName: string; sex: string;
  placeOfBirth: string; dateOfBirth: string; nationality: string;
  maritalStatus: string; phoneNumber: string; email: string;
  occupation: string; employer: string; position: string;
  companyAddress: string; companyCity: string; companyProvince: string;
  companyCountry: string; workPhone: string;
  // 2. Passport
  passportNumber: string; passportPlace: string; passportIssueDate: string;
  passportExpiryDate: string; passportType: string;
  // 3. Canada address
  addressStreet: string; addressCity: string; addressProvince: string; addressPostalCode: string;
  addressCountry: string; fax: string; cellular: string;
  // 4. Purpose
  visaType: string; purposeOfVisit: string; purposeOther: string;
  // 5. Indonesia stay
  intendedAddressIndonesia: string; intendedCityIndonesia: string; intendedPhone: string;
  portOfEntry: string; dateOfEntry: string; flightIn: string;
  portOfExit: string; dateOfExit: string; flightOut: string;
  hasInvitationLetter: string;
  // 6. Sponsor
  sponsorName: string; sponsorPosition: string; sponsorCompany: string;
  sponsorAddress: string; sponsorCity: string; sponsorPhone: string; sponsorFax: string;
  // 7. Questions
  beenToIndonesiaBefore: string; indonesiaVisitDetails: string;
  hasOtherCountryVisa: string; otherVisaDetails: string;
  visaDenied: string; orderedToLeave: string; everArrested: string;
  // 8. Uploads (handled as File objects)
  disclaimerAccepted: boolean;
};

const INITIAL: Form = {
  firstName: "", middleName: "", familyName: "", sex: "",
  placeOfBirth: "", dateOfBirth: "", nationality: "Canada",
  maritalStatus: "", phoneNumber: "", email: "",
  occupation: "", employer: "", position: "",
  companyAddress: "", companyCity: "", companyProvince: "", companyCountry: "Canada", workPhone: "",
  passportNumber: "", passportPlace: "", passportIssueDate: "",
  passportExpiryDate: "", passportType: "Ordinary Passport",
  addressStreet: "", addressCity: "", addressProvince: "", addressPostalCode: "",
  addressCountry: "Canada", fax: "", cellular: "",
  visaType: "", purposeOfVisit: "", purposeOther: "",
  intendedAddressIndonesia: "", intendedCityIndonesia: "", intendedPhone: "",
  portOfEntry: "", dateOfEntry: "", flightIn: "",
  portOfExit: "", dateOfExit: "", flightOut: "",
  hasInvitationLetter: "No",
  sponsorName: "", sponsorPosition: "", sponsorCompany: "",
  sponsorAddress: "", sponsorCity: "", sponsorPhone: "", sponsorFax: "",
  beenToIndonesiaBefore: "No", indonesiaVisitDetails: "",
  hasOtherCountryVisa: "No", otherVisaDetails: "",
  visaDenied: "No", orderedToLeave: "No", everArrested: "No",
  disclaimerAccepted: false,
};

function fieldCls(invalid: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
    invalid ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
  }`;
}
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className="block mb-1 text-sm font-medium text-gray-700">{children}{required && <span className="text-red-500 ml-0.5">*</span>}</label>;
}
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Err({ show, msg }: { show: boolean; msg: string }) {
  if (!show) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">⚠ {msg}</p>;
}
function YesNo({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-4">
      {["Yes", "No"].map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="accent-emerald-600" />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function VisaWizard() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [files, setFiles] = useState<Record<string, File | null>>({
    passportScan: null, photoScan: null, invitationLetter: null, supportingDoc: null,
  });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const step = STEPS[stepIdx];

  function set(field: keyof Form, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    set(e.target.name as keyof Form, e.target.value);
  }

  function validateStep(): boolean {
    const f = form;
    switch (step.id) {
      case "personal": return !!(f.firstName && f.familyName && f.sex && f.placeOfBirth && f.dateOfBirth && f.nationality && f.email && f.phoneNumber);
      case "passport": return !!(f.passportNumber && f.passportPlace && f.passportIssueDate && f.passportExpiryDate);
      case "address":  return !!(f.addressStreet && f.addressCity && f.addressProvince && f.addressPostalCode);
      case "purpose":  return !!(f.visaType && f.purposeOfVisit);
      case "uploads":  return !!files.passportScan;
      default: return true;
    }
  }

  function next() {
    setTouched(true);
    if (!validateStep()) return;
    setTouched(false);
    setStepIdx(i => i + 1);
    window.scrollTo(0, 0);
  }
  function back() { setStepIdx(i => i - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      // Map visa form to submission fields
      fd.append("fullName", [form.firstName, form.middleName, form.familyName].filter(Boolean).join(" "));
      fd.append("aliasName", "");
      fd.append("gender", form.sex === "Male" ? "Laki-laki" : "Perempuan");
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("birthCity", form.placeOfBirth);
      fd.append("birthCountry", "");
      fd.append("nationality", form.nationality);
      fd.append("religion", "");
      fd.append("birthCertIssuedIn", "");
      fd.append("registrationId", "");
      fd.append("passportId", form.passportNumber);
      fd.append("passportIssueDate", form.passportIssueDate);
      fd.append("passportExpiryDate", form.passportExpiryDate);
      fd.append("oldPassportNumber", "");
      fd.append("oldPassportIssueDate", "");
      fd.append("oldPassportExpiryDate", "");
      fd.append("oldPassportIssuer", form.passportPlace);
      fd.append("ktpNumber", "");
      fd.append("ktpIssueDate", "");
      fd.append("birthCertNumber", "");
      fd.append("addressCanadaStreet", form.addressStreet);
      fd.append("addressCanadaCity", form.addressCity);
      fd.append("addressCanadaProvince", form.addressProvince);
      fd.append("addressCanadaPostalCode", form.addressPostalCode);
      fd.append("addressIndonesiaStreet", form.intendedAddressIndonesia);
      fd.append("addressIndonesiaCity", form.intendedCityIndonesia);
      fd.append("addressIndonesiaProvince", "");
      fd.append("addressIndonesiaDistrict", "");
      fd.append("addressIndonesiaPostalCode", "");
      fd.append("phoneNumber", form.phoneNumber.replace(/\D/g, "").slice(0, 10));
      fd.append("email", form.email);
      fd.append("maritalStatus", form.maritalStatus);
      fd.append("occupation", form.occupation);
      fd.append("workplace", form.employer);
      fd.append("workplaceAddress", form.companyAddress);
      fd.append("stayStatus", "VR");
      fd.append("fatherName", "");
      fd.append("fatherBirthPlace", "");
      fd.append("fatherBirthDate", "");
      fd.append("fatherNationality", "");
      fd.append("fatherAddress", "");
      fd.append("motherName", "");
      fd.append("motherBirthPlace", "");
      fd.append("motherBirthDate", "");
      fd.append("motherNationality", "");
      fd.append("motherAddress", "");
      fd.append("spouseName", "");
      fd.append("spouseBirthPlace", "");
      fd.append("spouseBirthDate", "");
      fd.append("spouseNationality", "");
      fd.append("spouseAddress", "");
      fd.append("emergencyCanadaName", form.sponsorName);
      fd.append("emergencyCanadaAddress", form.sponsorAddress);
      fd.append("emergencyCanadaPhone", form.sponsorPhone);
      fd.append("emergencyCanadaRelation", "Sponsor");
      fd.append("emergencyIndonesiaName", "");
      fd.append("emergencyIndonesiaAddress", "");
      fd.append("emergencyIndonesiaPhone", "");
      fd.append("emergencyIndonesiaRelation", "");
      fd.append("previousPassportStatus", "still_valid");
      fd.append("isChildPassportRequest", "false");
      fd.append("reason", `${form.visaType} — ${form.purposeOfVisit}${form.purposeOther ? ": " + form.purposeOther : ""}`);
      fd.append("disclaimerAccepted", "true");
      fd.append("portalType", "visa");
      // Visa-specific notes stored in workplace field
      fd.append("portOfEntry", form.portOfEntry);
      fd.append("dateOfEntry", form.dateOfEntry);
      fd.append("portOfExit", form.portOfExit);
      fd.append("dateOfExit", form.dateOfExit);

      // Files
      if (files.passportScan) fd.append("passportScan", files.passportScan);
      if (files.invitationLetter) fd.append("formScan", files.invitationLetter);
      if (files.supportingDoc) fd.append("otherIdScan", files.supportingDoc);

      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Submission failed");
      }
      const sub = await res.json();
      router.push(`/submit/complete?ref=${sub.applicationRef}`);
    } catch (e: any) {
      setSubmitError(e.message ?? "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  const f = form;
  const inv = (cond: boolean) => touched && cond;

  return (
    <div className="min-h-screen">
      {/* Header band */}
      <div className="bg-[#0d2b5e] py-8 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">KJRI Vancouver</p>
          <h1 className="text-2xl font-bold text-white">Indonesian Visa Application</h1>
          <p className="text-sm text-blue-200/80 mt-1">Complete all sections below and submit your application online.</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition ${
                i === stepIdx ? "bg-emerald-600 text-white" :
                i < stepIdx ? "bg-emerald-100 text-emerald-700" : "text-gray-400"
              }`}>
                {i < stepIdx ? "✓" : i + 1} {s.title}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-3 mx-0.5 ${i < stepIdx ? "bg-emerald-300" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">

        {/* ── STEP 1: Personal Info ── */}
        {step.id === "personal" && (
          <Card title="1. Personal Information" subtitle="Enter your details exactly as they appear in your passport.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label required>First Name</Label>
                <input className={fieldCls(inv(!f.firstName))} name="firstName" value={f.firstName} onChange={handleChange} placeholder="First name" />
                <Err show={inv(!f.firstName)} msg="Required" />
              </div>
              <div>
                <Label>Middle Name</Label>
                <input className={fieldCls(false)} name="middleName" value={f.middleName} onChange={handleChange} placeholder="Middle name (optional)" />
              </div>
              <div>
                <Label required>Family Name</Label>
                <input className={fieldCls(inv(!f.familyName))} name="familyName" value={f.familyName} onChange={handleChange} placeholder="Family / last name" />
                <Err show={inv(!f.familyName)} msg="Required" />
              </div>
            </div>

            <div>
              <Label required>Sex</Label>
              <div className="flex gap-6">
                {["Male", "Female"].map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="sex" value={s} checked={f.sex === s} onChange={() => set("sex", s)} className="accent-emerald-600" />
                    {s}
                  </label>
                ))}
              </div>
              <Err show={inv(!f.sex)} msg="Required" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Place of Birth (city & country)</Label>
                <input className={fieldCls(inv(!f.placeOfBirth))} name="placeOfBirth" value={f.placeOfBirth} onChange={handleChange} placeholder="e.g. Toronto, Canada" />
                <Err show={inv(!f.placeOfBirth)} msg="Required" />
              </div>
              <div>
                <Label required>Date of Birth</Label>
                <input type="date" className={fieldCls(inv(!f.dateOfBirth))} name="dateOfBirth" value={f.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
                <Err show={inv(!f.dateOfBirth)} msg="Required" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Nationality</Label>
                <input className={fieldCls(inv(!f.nationality))} name="nationality" value={f.nationality} onChange={handleChange} placeholder="e.g. Canadian" />
                <Err show={inv(!f.nationality)} msg="Required" />
              </div>
              <div>
                <Label>Marital Status</Label>
                <select className={fieldCls(false)} name="maritalStatus" value={f.maritalStatus} onChange={handleChange}>
                  <option value="">-- Select --</option>
                  {MARITAL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Phone Number (Canada)</Label>
                <input type="tel" className={fieldCls(inv(!f.phoneNumber))} name="phoneNumber" value={f.phoneNumber} onChange={handleChange} placeholder="(604) 123-4567" />
                <Err show={inv(!f.phoneNumber)} msg="Required" />
              </div>
              <div>
                <Label required>Email</Label>
                <input type="email" className={fieldCls(inv(!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)))} name="email" value={f.email} onChange={handleChange} placeholder="your@email.com" />
                <Err show={inv(!f.email)} msg="Required" />
                <Err show={inv(!!f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))} msg="Invalid email format" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Occupation / Employment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Occupation</Label>
                  <input className={fieldCls(false)} name="occupation" value={f.occupation} onChange={handleChange} placeholder="e.g. Engineer" />
                </div>
                <div>
                  <Label>Present Employer</Label>
                  <input className={fieldCls(false)} name="employer" value={f.employer} onChange={handleChange} placeholder="Company name" />
                </div>
                <div>
                  <Label>Position / Title</Label>
                  <input className={fieldCls(false)} name="position" value={f.position} onChange={handleChange} placeholder="Job title" />
                </div>
                <div>
                  <Label>Work Phone</Label>
                  <input className={fieldCls(false)} name="workPhone" value={f.workPhone} onChange={handleChange} placeholder="Work phone number" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Company / Institution Address</Label>
                <input className={fieldCls(false)} name="companyAddress" value={f.companyAddress} onChange={handleChange} placeholder="Street address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <Label>City</Label>
                  <input className={fieldCls(false)} name="companyCity" value={f.companyCity} onChange={handleChange} />
                </div>
                <div>
                  <Label>Province</Label>
                  <input className={fieldCls(false)} name="companyProvince" value={f.companyProvince} onChange={handleChange} />
                </div>
                <div>
                  <Label>Country</Label>
                  <input className={fieldCls(false)} name="companyCountry" value={f.companyCountry} onChange={handleChange} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: Passport ── */}
        {step.id === "passport" && (
          <Card title="2. Passport Information" subtitle="Enter your current passport details.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Passport Number</Label>
                <input className={fieldCls(inv(!f.passportNumber))} name="passportNumber" value={f.passportNumber} onChange={handleChange} placeholder="e.g. AB1234567" />
                <Err show={inv(!f.passportNumber)} msg="Required" />
              </div>
              <div>
                <Label required>Place of Issuance (city & country)</Label>
                <input className={fieldCls(inv(!f.passportPlace))} name="passportPlace" value={f.passportPlace} onChange={handleChange} placeholder="e.g. Ottawa, Canada" />
                <Err show={inv(!f.passportPlace)} msg="Required" />
              </div>
              <div>
                <Label required>Date of Issuance</Label>
                <input type="date" className={fieldCls(inv(!f.passportIssueDate))} name="passportIssueDate" value={f.passportIssueDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
                <Err show={inv(!f.passportIssueDate)} msg="Required" />
              </div>
              <div>
                <Label required>Date of Expiry</Label>
                <input type="date" className={fieldCls(inv(!f.passportExpiryDate))} name="passportExpiryDate" value={f.passportExpiryDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
                <Err show={inv(!f.passportExpiryDate)} msg="Required" />
              </div>
            </div>
            <div>
              <Label>Type of Passport</Label>
              <div className="flex flex-wrap gap-4">
                {PASSPORT_TYPES.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="passportType" value={t} checked={f.passportType === t} onChange={() => set("passportType", t)} className="accent-emerald-600" />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <strong>Note:</strong> Your passport must be valid for at least 6 months beyond your intended stay in Indonesia.
            </div>
          </Card>
        )}

        {/* ── STEP 3: Canada Address ── */}
        {step.id === "address" && (
          <Card title="3. Address in Canada" subtitle="Your current residential address in Canada.">
            <div>
              <Label required>Street Address</Label>
              <input className={fieldCls(inv(!f.addressStreet))} name="addressStreet" value={f.addressStreet} onChange={handleChange} placeholder="123 Main Street, Unit 4" />
              <Err show={inv(!f.addressStreet)} msg="Required" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>City</Label>
                <input className={fieldCls(inv(!f.addressCity))} name="addressCity" value={f.addressCity} onChange={handleChange} placeholder="Vancouver" />
                <Err show={inv(!f.addressCity)} msg="Required" />
              </div>
              <div>
                <Label required>Province & Postal Code</Label>
                <div className="flex gap-2">
                  <input className={fieldCls(inv(!f.addressProvince))} name="addressProvince" value={f.addressProvince} onChange={handleChange} placeholder="BC" />
                  <input className={fieldCls(inv(!f.addressPostalCode))} name="addressPostalCode" value={f.addressPostalCode} onChange={handleChange} placeholder="V6G 1A6" />
                </div>
                <Err show={inv(!f.addressProvince || !f.addressPostalCode)} msg="Required" />
              </div>
            </div>
            <div>
              <Label>Country</Label>
              <input className={fieldCls(false)} name="addressCountry" value={f.addressCountry} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Fax</Label>
                <input className={fieldCls(false)} name="fax" value={f.fax} onChange={handleChange} />
              </div>
              <div>
                <Label>Cellular / Mobile</Label>
                <input className={fieldCls(false)} name="cellular" value={f.cellular} onChange={handleChange} />
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 4: Purpose ── */}
        {step.id === "purpose" && (
          <Card title="4. Purpose of Visit" subtitle="Select the type of visa and your reason for visiting Indonesia.">
            <div>
              <Label required>Type of Visa Requested</Label>
              <div className="grid grid-cols-2 gap-3">
                {VISA_TYPES.map(t => (
                  <label key={t} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${f.visaType === t ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="visaType" value={t} checked={f.visaType === t} onChange={() => set("visaType", t)} className="accent-emerald-600" />
                    <span className="text-sm font-medium">{t}</span>
                  </label>
                ))}
              </div>
              <Err show={inv(!f.visaType)} msg="Required" />
            </div>
            <div>
              <Label required>Purpose of Visit to Indonesia</Label>
              <div className="grid grid-cols-2 gap-2">
                {PURPOSES.map(p => (
                  <label key={p} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition text-sm ${f.purposeOfVisit === p ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="purposeOfVisit" value={p} checked={f.purposeOfVisit === p} onChange={() => set("purposeOfVisit", p)} className="accent-emerald-600" />
                    {p}
                  </label>
                ))}
              </div>
              <Err show={inv(!f.purposeOfVisit)} msg="Required" />
            </div>
            {f.purposeOfVisit === "Others" && (
              <div>
                <Label>Please specify</Label>
                <input className={fieldCls(false)} name="purposeOther" value={f.purposeOther} onChange={handleChange} placeholder="Describe your purpose" />
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 5: Indonesia Stay ── */}
        {step.id === "indonesia" && (
          <Card title="5. Intended Stay in Indonesia" subtitle="Where will you be staying and your travel details.">
            <div>
              <Label>Intended Address in Indonesia</Label>
              <input className={fieldCls(false)} name="intendedAddressIndonesia" value={f.intendedAddressIndonesia} onChange={handleChange} placeholder="Hotel name or address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>City & Province</Label>
                <input className={fieldCls(false)} name="intendedCityIndonesia" value={f.intendedCityIndonesia} onChange={handleChange} placeholder="e.g. Bali, Bali" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <input className={fieldCls(false)} name="intendedPhone" value={f.intendedPhone} onChange={handleChange} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Flight / Vessel Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Port of Entry</Label>
                  <input className={fieldCls(false)} name="portOfEntry" value={f.portOfEntry} onChange={handleChange} placeholder="e.g. Ngurah Rai, Bali" />
                </div>
                <div>
                  <Label>Date of Entry</Label>
                  <input type="date" className={fieldCls(false)} name="dateOfEntry" value={f.dateOfEntry} onChange={handleChange} />
                </div>
                <div>
                  <Label>Flight / Vessel No.</Label>
                  <input className={fieldCls(false)} name="flightIn" value={f.flightIn} onChange={handleChange} placeholder="e.g. GA718" />
                </div>
                <div>
                  <Label>Port of Exit</Label>
                  <input className={fieldCls(false)} name="portOfExit" value={f.portOfExit} onChange={handleChange} placeholder="e.g. Soekarno-Hatta" />
                </div>
                <div>
                  <Label>Date of Exit</Label>
                  <input type="date" className={fieldCls(false)} name="dateOfExit" value={f.dateOfExit} onChange={handleChange} />
                </div>
                <div>
                  <Label>Flight / Vessel No.</Label>
                  <input className={fieldCls(false)} name="flightOut" value={f.flightOut} onChange={handleChange} placeholder="e.g. GA719" />
                </div>
              </div>
            </div>

            <div>
              <Label>Do you have an Invitation / Reference Letter?</Label>
              <YesNo name="hasInvitationLetter" value={f.hasInvitationLetter} onChange={v => set("hasInvitationLetter", v)} />
              {f.hasInvitationLetter === "Yes" && (
                <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  Please upload your invitation letter in the Documents step.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* ── STEP 6: Sponsor ── */}
        {step.id === "sponsor" && (
          <Card title="6. Contact Person / Sponsor in Indonesia" subtitle="If you have a sponsor or contact person in Indonesia.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <input className={fieldCls(false)} name="sponsorName" value={f.sponsorName} onChange={handleChange} />
              </div>
              <div>
                <Label>Position / Title</Label>
                <input className={fieldCls(false)} name="sponsorPosition" value={f.sponsorPosition} onChange={handleChange} />
              </div>
              <div>
                <Label>Company / Institution</Label>
                <input className={fieldCls(false)} name="sponsorCompany" value={f.sponsorCompany} onChange={handleChange} />
              </div>
              <div>
                <Label>Phone</Label>
                <input className={fieldCls(false)} name="sponsorPhone" value={f.sponsorPhone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <input className={fieldCls(false)} name="sponsorAddress" value={f.sponsorAddress} onChange={handleChange} placeholder="Street, city, province & postal code" />
            </div>
            <p className="text-xs text-gray-500">If you do not have a sponsor, you may leave this section blank.</p>
          </Card>
        )}

        {/* ── STEP 7: Background Questions ── */}
        {step.id === "questions" && (
          <Card title="7. Background Questions" subtitle="Answer truthfully. A YES does not automatically disqualify your application.">
            {([
              { key: "beenToIndonesiaBefore", label: "Have you ever been to Indonesia before?", detailKey: "indonesiaVisitDetails", detailPlaceholder: "When and how long did you stay?" },
              { key: "hasOtherCountryVisa", label: "Are you in possession of another country's valid visa?", detailKey: "otherVisaDetails", detailPlaceholder: "Country of issuance" },
            ] as const).map(({ key, label, detailKey, detailPlaceholder }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <YesNo name={key} value={(f as any)[key]} onChange={v => set(key as keyof Form, v)} />
                {(f as any)[key] === "Yes" && (
                  <input className={fieldCls(false)} name={detailKey} value={(f as any)[detailKey]} onChange={handleChange} placeholder={detailPlaceholder} />
                )}
              </div>
            ))}

            {([
              { key: "visaDenied",      label: "Has your application for Indonesian Visa ever been denied?" },
              { key: "orderedToLeave",  label: "Have you ever been ordered to leave Indonesia?" },
              { key: "everArrested",    label: "Have you ever been arrested or convicted of a criminal act?" },
            ] as const).map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <YesNo name={key} value={(f as any)[key]} onChange={v => set(key as keyof Form, v)} />
              </div>
            ))}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              While a YES answer does not automatically signify ineligibility for a visa, you may be required to personally appear before a consular officer.
            </div>
          </Card>
        )}

        {/* ── STEP 8: Uploads ── */}
        {step.id === "uploads" && (
          <Card title="8. Document Uploads" subtitle="Upload your passport scan and supporting documents as PDF or JPG (max 10MB each).">
            {([
              { key: "passportScan", label: "Passport (identity page)", required: true, hint: "Photo page with your photo and personal details" },
              { key: "photoScan", label: "Passport-size photo (40mm × 60mm)", required: false, hint: "Recent photo, plain background" },
              { key: "invitationLetter", label: "Invitation / Reference Letter", required: false, hint: "Required if you answered Yes above" },
              { key: "supportingDoc", label: "Other Supporting Document", required: false, hint: "Flight ticket, hotel booking, etc." },
            ] as const).map(({ key, label, required, hint }) => (
              <div key={key}>
                <Label required={required}>{label}</Label>
                {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
                <div
                  onClick={() => document.getElementById(`file-${key}`)?.click()}
                  className={`flex items-center justify-between border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${
                    files[key] ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                  }`}
                >
                  <span className="text-sm text-gray-600">{files[key] ? files[key]!.name : "Click to select file (PDF or JPG)"}</span>
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <input id={`file-${key}`} type="file" accept="application/pdf,image/jpeg,image/jpg" className="hidden"
                    onChange={e => setFiles(prev => ({ ...prev, [key]: e.target.files?.[0] ?? null }))} />
                </div>
                {required && inv(!files[key]) && <Err show msg="Required — please upload your passport scan" />}
              </div>
            ))}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={f.disclaimerAccepted} onChange={e => set("disclaimerAccepted", e.target.checked)} className="mt-0.5 accent-emerald-600" />
                <span className="text-xs text-emerald-800 leading-relaxed">
                  I hereby declare that the statements given are true and correct. I understand that any false or misleading statement may result in permanent refusal of a visa. I am aware that even with a valid visa, permission to enter Indonesia remains at the discretion of the Immigration authorities.
                </span>
              </label>
              <Err show={inv(!f.disclaimerAccepted)} msg="You must accept the declaration to proceed" />
            </div>
          </Card>
        )}

        {/* ── STEP 9: Review ── */}
        {step.id === "review" && (
          <Card title="9. Review & Submit" subtitle="Please review your information before submitting.">
            {[
              { title: "Personal", items: [
                ["Full Name", [f.firstName, f.middleName, f.familyName].filter(Boolean).join(" ")],
                ["Date of Birth", f.dateOfBirth], ["Nationality", f.nationality],
                ["Email", f.email], ["Phone", f.phoneNumber],
              ]},
              { title: "Passport", items: [
                ["Passport No.", f.passportNumber], ["Type", f.passportType],
                ["Issued", `${f.passportIssueDate} at ${f.passportPlace}`],
                ["Expiry", f.passportExpiryDate],
              ]},
              { title: "Address", items: [
                ["Street", f.addressStreet], ["City", `${f.addressCity}, ${f.addressProvince} ${f.addressPostalCode}`],
              ]},
              { title: "Purpose", items: [
                ["Visa Type", f.visaType], ["Purpose", f.purposeOfVisit + (f.purposeOther ? ": " + f.purposeOther : "")],
              ]},
              { title: "Indonesia Stay", items: [
                ["Address", f.intendedAddressIndonesia || "—"],
                ["Entry", `${f.portOfEntry || "—"} on ${f.dateOfEntry || "—"}`],
                ["Exit", `${f.portOfExit || "—"} on ${f.dateOfExit || "—"}`],
              ]},
              { title: "Documents", items: [
                ["Passport scan", files.passportScan?.name ?? "—"],
                ["Photo", files.photoScan?.name ?? "—"],
                ["Invitation letter", files.invitationLetter?.name ?? "—"],
              ]},
            ].map(section => (
              <div key={section.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{section.title}</p>
                <div className="space-y-1">
                  {section.items.map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-28 shrink-0">{k}:</span>
                      <span className="text-gray-800 font-medium">{v || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {stepIdx > 0 ? (
            <button type="button" onClick={back} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
              ← Back
            </button>
          ) : <div />}

          {stepIdx < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer">
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting || !f.disclaimerAccepted}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Submitting…</>
              ) : "Submit Application →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
