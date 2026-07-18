import React, { useMemo } from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { MARITAL_STATUSES } from "../config/visaConfig";
import { COUNTRIES } from "@/lib/countries";

export default function PersonalStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
  excludedNationalities = [],
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
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  excludedNationalities?: string[];
}) {
  const nationalityOptions = useMemo(() => {
    const excluded = new Set(excludedNationalities);
    // Always keep the currently-selected value selectable, even if it was
    // excluded after this application was started, so we don't silently
    // blank out something the applicant already chose.
    const list = COUNTRIES.filter((c) => !excluded.has(c) || c === form.nationality);
    return list;
  }, [excludedNationalities, form.nationality]);
  return (
    <SectionCard
      subtitle="Sections 1–6 &amp; 12 of the Visa Application Form — enter your details exactly as they appear in your passport."
    >
      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">1. First Name</label>
          <input
            className={fieldCls(inv(!form.firstName.trim()))}
            name="firstName"
            maxLength={50}
            value={form.firstName}
            onChange={handleChange}
            placeholder="As in passport"
            required
          />
          <FieldError show={inv(!form.firstName.trim())} message="First name is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">
            2. Middle Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className={fieldCls(false)}
            name="middleName"
            maxLength={50}
            value={form.middleName}
            onChange={handleChange}
            placeholder="As in passport"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium min-h-[20px]">3. Family Name</label>
          <input
            className={fieldCls(inv(!form.familyName.trim()))}
            name="familyName"
            maxLength={50}
            value={form.familyName}
            onChange={handleChange}
            placeholder="As in passport"
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
          <label className="block mb-1 font-medium">4. Place of Birth (city &amp; country)</label>
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
            label="5. Date of Birth"
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
          <label className="block mb-1 font-medium">6. Nationality</label>
          <select
            className={fieldCls(inv(!form.nationality.trim()))}
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            {nationalityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError show={inv(!form.nationality.trim())} message="Nationality is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            12. Marital Status <span className="text-gray-400 font-normal">(optional)</span>
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
    </SectionCard>
  );
}
