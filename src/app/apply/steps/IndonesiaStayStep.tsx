import React from "react";
import SectionCard from "../ui/SectionCard";

export default function IndonesiaStayStep({
  form,
  fieldCls,
  handleChange,
  todayStr,
  hasInvitationLetter,
  onToggleInvitationLetter,
}: {
  form: {
    intendedAddressIndonesia: string;
    intendedCityIndonesia: string;
    intendedPhone: string;
    portOfEntry: string;
    dateOfEntry: string;
    flightIn: string;
    portOfExit: string;
    dateOfExit: string;
    flightOut: string;
  };
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  todayStr: string;
  hasInvitationLetter: boolean;
  onToggleInvitationLetter: (v: boolean) => void;
}) {
  return (
    <SectionCard
      subtitle="Where you will be staying and your travel details (optional but recommended)."
    >
      <div>
        <label className="block mb-1 font-medium">Intended Address in Indonesia</label>
        <input
          className={fieldCls(false)}
          name="intendedAddressIndonesia"
          maxLength={200}
          value={form.intendedAddressIndonesia}
          onChange={handleChange}
          placeholder="Hotel name or full address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">City &amp; Province</label>
          <input
            className={fieldCls(false)}
            name="intendedCityIndonesia"
            maxLength={100}
            value={form.intendedCityIndonesia}
            onChange={handleChange}
            placeholder="e.g. Denpasar, Bali"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone Number in Indonesia</label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            >
              +62
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              className={fieldCls(false, "pl-12")}
              name="intendedPhone"
              maxLength={13}
              value={form.intendedPhone.replace(/^\+62/, "")}
              onChange={(e) => {
                let digits = e.target.value.replace(/\D/g, "");
                // Accept +62..., 62..., or 08... without duplicating the country code.
                digits = digits.replace(/^62/, "").replace(/^0+/, "").slice(0, 13);
                handleChange({
                  target: {
                    name: "intendedPhone",
                    value: digits ? `+62${digits}` : "",
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              placeholder="81234567890"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">Flight / Vessel Information</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Port of Entry</label>
            <input className={fieldCls(false)} name="portOfEntry" maxLength={80} value={form.portOfEntry} onChange={handleChange} placeholder="e.g. Ngurah Rai, Bali" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Date of Entry</label>
            <input type="date" className={fieldCls(false)} name="dateOfEntry" min={todayStr} value={form.dateOfEntry} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Flight No.</label>
            <input className={fieldCls(false)} name="flightIn" maxLength={20} value={form.flightIn} onChange={handleChange} placeholder="e.g. GA718" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Port of Exit</label>
            <input className={fieldCls(false)} name="portOfExit" maxLength={80} value={form.portOfExit} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Date of Exit</label>
            <input type="date" className={fieldCls(false)} name="dateOfExit" min={form.dateOfEntry || todayStr} value={form.dateOfExit} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Flight No.</label>
            <input className={fieldCls(false)} name="flightOut" maxLength={20} value={form.flightOut} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">18. Do You Have an Invitation/Reference Letter?</p>
        <div className="flex gap-6">
          {[
            { label: "Yes", val: true },
            { label: "No", val: false },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="hasInvitationLetter"
                checked={hasInvitationLetter === opt.val}
                onChange={() => onToggleInvitationLetter(opt.val)}
                className="accent-red-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {hasInvitationLetter && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            Please submit a copy with the application — you'll upload it in the Documents step.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
