import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { MARITAL_STATUSES } from "../config/visaConfig";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// (604) 123-4567 style formatter for a 10-digit Canadian number
function formatPhone(num: string) {
  const c = num.replace(/\D/g, "").slice(0, 10);
  if (c.length >= 7) return `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}`;
  if (c.length >= 4) return `(${c.slice(0, 3)}) ${c.slice(3)}`;
  if (c.length >= 1) return `(${c}`;
  return "";
}

export default function PersonalStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
  setForm,
}: {
  form: {
    firstName: string;
    middleName: string;
    familyName: string;
    sex: string;
    placeOfBirth: string;
    dateOfBirth: string;
    nationality: string;
    maritalStatus: string;
    phoneNumber: string;
    email: string;
    occupation: string;
    employer: string;
    position: string;
    companyAddress: string;
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  const phoneDigits = form.phoneNumber.replace(/\D/g, "");

  return (
    <SectionCard
      title="Personal Information"
      subtitle="Enter your details exactly as they appear in your passport."
    >
      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            className={fieldCls(inv(!form.firstName.trim()))}
            name="firstName"
            maxLength={50}
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            required
          />
          <FieldError show={inv(!form.firstName.trim())} message="First name is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Middle Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className={fieldCls(false)}
            name="middleName"
            maxLength={50}
            value={form.middleName}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Family Name</label>
          <input
            className={fieldCls(inv(!form.familyName.trim()))}
            name="familyName"
            maxLength={50}
            value={form.familyName}
            onChange={handleChange}
            placeholder="Last name"
            required
          />
          <FieldError show={inv(!form.familyName.trim())} message="Family name is required." />
        </div>
      </div>

      {/* Sex */}
      <div>
        <label className="block mb-1 font-medium">Sex</label>
        <div className="flex gap-6">
          {["Male", "Female"].map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="sex"
                value={s}
                checked={form.sex === s}
                onChange={handleChange}
                className="accent-red-600"
              />
              {s}
            </label>
          ))}
        </div>
        <FieldError show={inv(!form.sex)} message="Please select your sex." />
      </div>

      {/* Birth + nationality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Place of Birth (city &amp; country)</label>
          <input
            className={fieldCls(inv(!form.placeOfBirth.trim()))}
            name="placeOfBirth"
            maxLength={100}
            value={form.placeOfBirth}
            onChange={handleChange}
            placeholder="e.g. Toronto, Canada"
            required
          />
          <FieldError show={inv(!form.placeOfBirth.trim())} message="Place of birth is required." />
        </div>
        <div>
          <DateSelect
            label="Date of Birth"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            max={todayStr}
            yearStart={1900}
            yearEnd={new Date().getFullYear()}
          />
          <FieldError show={inv(!form.dateOfBirth)} message="Date of birth is required." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Nationality</label>
          <input
            className={fieldCls(inv(!form.nationality.trim()))}
            name="nationality"
            maxLength={60}
            value={form.nationality}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.nationality.trim())} message="Nationality is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Marital Status <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select className={fieldCls(false)} name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
            <option value="">-- Select --</option>
            {MARITAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Phone Number (Canada, 10 digits)</label>
          <input
            type="text"
            inputMode="numeric"
            className={fieldCls(inv(phoneDigits.length !== 10))}
            name="phoneNumber"
            value={formatPhone(form.phoneNumber)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((prev: any) => ({ ...prev, phoneNumber: digits }));
            }}
            placeholder="(604) 123-4567"
            required
          />
          <FieldError show={inv(phoneDigits.length !== 10)} message="Phone number must be exactly 10 digits." />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className={fieldCls(inv(!form.email.trim() || !emailRe.test(form.email)))}
            name="email"
            maxLength={254}
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
          <FieldError show={inv(!form.email.trim())} message="Email is required." />
          <FieldError
            show={inv(!!form.email.trim() && !emailRe.test(form.email))}
            message="Invalid email format. Example: name@email.com"
          />
        </div>
      </div>

      {/* Employment (optional) */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">Occupation / Employment (optional)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Occupation</label>
            <input className={fieldCls(false)} name="occupation" maxLength={60} value={form.occupation} onChange={handleChange} placeholder="e.g. Engineer" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Present Employer</label>
            <input className={fieldCls(false)} name="employer" maxLength={80} value={form.employer} onChange={handleChange} placeholder="Company name" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Position / Title</label>
            <input className={fieldCls(false)} name="position" maxLength={60} value={form.position} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Company Address</label>
            <input className={fieldCls(false)} name="companyAddress" maxLength={150} value={form.companyAddress} onChange={handleChange} placeholder="Street, city, province" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
