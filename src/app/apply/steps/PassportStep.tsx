import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";
import DateSelect from "@/components/DateSelect";
import { PASSPORT_TYPES } from "../config/visaConfig";

export default function PassportStep({
  form,
  todayStr,
  inv,
  fieldCls,
  handleChange,
}: {
  form: {
    passportNumber: string;
    passportPlace: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    passportType: string;
  };
  todayStr: string;
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  const thisYear = new Date().getFullYear();

  return (
    <SectionCard subtitle="Enter your current passport details.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Passport Number</label>
          <input
            className={fieldCls(inv(!form.passportNumber.trim()))}
            name="passportNumber"
            maxLength={20}
            value={form.passportNumber}
            onChange={(e) =>
              handleChange({
                target: { name: "passportNumber", value: e.target.value.toUpperCase() },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder="e.g. AB1234567"
            required
          />
          <FieldError show={inv(!form.passportNumber.trim())} message="Passport number is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">Place of Issuance (city &amp; country)</label>
          <input
            className={fieldCls(inv(!form.passportPlace.trim()))}
            name="passportPlace"
            maxLength={80}
            value={form.passportPlace}
            onChange={handleChange}
            placeholder="e.g. Ottawa, Canada"
            required
          />
          <FieldError show={inv(!form.passportPlace.trim())} message="Place of issuance is required." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-900">Date of Issuance</p>
            <p className="text-[11px] text-gray-500">The date your passport was issued</p>
          </div>
          <DateSelect
            label=""
            name="passportIssueDate"
            value={form.passportIssueDate}
            onChange={handleChange}
            required
            max={todayStr}
            yearStart={1990}
            yearEnd={thisYear}
          />
          <FieldError show={inv(!form.passportIssueDate)} message="Date of issuance is required." />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-900">Date of Expiry</p>
            <p className="text-[11px] text-gray-500">The date your passport expires</p>
          </div>
          <DateSelect
            label=""
            name="passportExpiryDate"
            value={form.passportExpiryDate}
            onChange={handleChange}
            required
            min={todayStr}
            yearStart={thisYear}
            yearEnd={thisYear + 15}
          />
          <FieldError show={inv(!form.passportExpiryDate)} message="Date of expiry is required." />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Type of Passport</label>
        <div className="flex flex-wrap gap-4">
          {PASSPORT_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="passportType"
                value={t}
                checked={form.passportType === t}
                onChange={handleChange}
                className="accent-red-600"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <strong>Note:</strong> Your passport must be valid for at least 6 months beyond your
        intended stay in Indonesia.
      </div>
    </SectionCard>
  );
}
