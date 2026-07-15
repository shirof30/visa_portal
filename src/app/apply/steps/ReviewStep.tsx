import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import type { UploadItem } from "../ui/UploadRow";
import { APPLICANT_TYPES } from "../config/visaConfig";

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
  uploadItems,
  show,
  onEdit,
  inv,
  fieldCls,
  handleChange,
  todayStr,
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
  const applicantLabel = APPLICANT_TYPES.find((t) => t.value === form.applicantType)?.label ?? "-";
  const fullName = [form.firstName, form.middleName, form.familyName].filter(Boolean).join(" ");

  const card = "rounded-xl border border-gray-200 bg-gray-50 p-4";
  const editBtn = "text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer";

  return (
    <SectionCard title="Review & Submit" subtitle="Please review all your information before submitting.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
        {/* Visa type + purpose */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Visa & Purpose</p>
            <button type="button" onClick={() => onEdit("purpose")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Applicant type" value={applicantLabel} />
            <Row label="Type of visa requested" value={show(form.typeOfVisaRequested)} />
            <Row label="Purpose of visit" value={show(form.purposeOfVisit === "Others" ? form.purposeOther : form.purposeOfVisit)} />
          </div>
        </div>

        {/* Personal */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Personal</p>
            <button type="button" onClick={() => onEdit("personal")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Name" value={show(fullName)} />
            <Row label="Sex" value={show(form.sex)} />
            <Row label="Date of birth" value={show(form.dateOfBirth)} />
            <Row label="Place of birth" value={show(form.placeOfBirth)} />
            <Row label="Nationality" value={show(form.nationality)} />
            <Row label="Marital status" value={show(form.maritalStatus)} />
          </div>
        </div>

        {/* Passport */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Passport</p>
            <button type="button" onClick={() => onEdit("passport")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Number" value={show(form.passportNumber)} />
            <Row label="Place of issue" value={show(form.passportPlace)} />
            <Row label="Issued" value={show(form.passportIssueDate)} />
            <Row label="Expires" value={show(form.passportExpiryDate)} />
            <Row label="Type" value={show(form.passportType)} />
          </div>
        </div>

        {/* Address */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Address in Canada</p>
            <button type="button" onClick={() => onEdit("address")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Street" value={show([form.addressUnit, form.addressStreet].filter(Boolean).join(", "))} />
            <Row label="City" value={show(form.addressCity)} />
            <Row label="Province" value={show(form.addressProvince)} />
            <Row label="Postal code" value={show(form.addressPostalCode)} />
            <Row label="Phone" value={show(form.phoneNumber)} />
            <Row label="Email" value={show(form.email)} />
          </div>
        </div>

        {/* Occupation */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Occupation</p>
            <button type="button" onClick={() => onEdit("occupation")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Employer" value={show(form.occupationEmployer)} />
            <Row label="Position" value={show(form.occupationPosition)} />
          </div>
        </div>

        {/* Indonesia stay */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Stay in Indonesia</p>
            <button type="button" onClick={() => onEdit("indonesia")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Address" value={show(form.intendedAddressIndonesia)} />
            <Row label="City & province" value={show(form.intendedCityIndonesia)} />
            <Row label="Entry" value={show([form.portOfEntry, form.dateOfEntry].filter(Boolean).join(" • "))} />
            <Row label="Exit" value={show([form.portOfExit, form.dateOfExit].filter(Boolean).join(" • "))} />
            <Row label="Invitation/Reference letter" value={form.hasInvitationLetter ? "Yes" : "No"} />
          </div>
        </div>

        {/* Sponsor */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Sponsor</p>
            <button type="button" onClick={() => onEdit("sponsor")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Name" value={show(form.sponsorName)} />
            <Row label="Company" value={show(form.sponsorCompany)} />
            <Row label="Phone" value={show(form.sponsorPhone)} />
          </div>
        </div>

        {/* Background */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Background</p>
            <button type="button" onClick={() => onEdit("background")} className={editBtn}>Edit</button>
          </div>
          <div className="mt-2 space-y-1">
            <Row label="Been to Indonesia before" value={form.beenToIndonesiaBefore} />
            <Row label="Holds other valid visa" value={form.hasOtherCountryVisa} />
            <Row label="Visa ever denied" value={form.visaDenied} />
            <Row label="Ordered to leave" value={form.orderedToLeave} />
            <Row label="Arrested / convicted" value={form.everArrested} />
          </div>
        </div>

        {/* Documents */}
        <div className={`${card} md:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Documents</p>
            <button type="button" onClick={() => onEdit("uploads")} className={editBtn}>Edit</button>
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
                      {f ? f.name : missing ? "Missing required document" : "Not uploaded"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Declaration & signature — mirrors the bottom of page 2 of the official form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-600 italic leading-relaxed">
          I hereby declare that the statements given above are true and correct, and that I
          realize that even though I possess a valid Visa to enter Indonesia, permission to entry
          remains at the discretion of the Immigration authorities in Indonesia. I understand that
          any false or misleading statement may result in the permanent refusal of a visa or
          denial of entry into the Republic of Indonesia. I am also aware that failing to comply
          with the above requirements, I will be liable to prosecution or expulsion.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Applicant&apos;s Signature (type your full name)</label>
            <input
              className={fieldCls(inv(!form.signatureName.trim()))}
              name="signatureName"
              maxLength={100}
              value={form.signatureName}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
            <FieldError show={inv(!form.signatureName.trim())} message="Please type your full name to sign." />
          </div>
          <div>
            <DateSelect
              label="Date"
              name="signatureDate"
              value={form.signatureDate}
              onChange={handleChange}
              required
              max={todayStr}
              yearStart={2020}
              yearEnd={new Date().getFullYear()}
            />
            <FieldError show={inv(!form.signatureDate)} message="Please select the date." />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
