import React from "react";
import SectionCard from "../ui/SectionCard";

export default function IndonesiaStayStep({
  form,
  fieldCls,
  handleChange,
  todayStr,
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
}) {
  return (
    <SectionCard
      title="Intended Stay in Indonesia"
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
          <input
            type="tel"
            className={fieldCls(false)}
            name="intendedPhone"
            maxLength={15}
            value={form.intendedPhone}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "intendedPhone",
                  value: e.target.value.replace(/[^0-9+\-() ]/g, "").slice(0, 15),
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder="+62..."
          />
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
    </SectionCard>
  );
}
