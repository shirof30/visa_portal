import React from "react";
import SectionCard from "../ui/SectionCard";

export default function OccupationStep({
  form,
  fieldCls,
  handleChange,
}: {
  form: {
    occupationEmployer: string;
    occupationPosition: string;
    occupationCompanyAddress: string;
    occupationCity: string;
    occupationProvincePostal: string;
    occupationCountry: string;
    occupationPhone: string;
    occupationFax: string;
  };
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <SectionCard
      title="14. Occupation"
      subtitle="Optional — fill in if you are currently employed or run a business."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Present Employer</label>
          <input className={fieldCls(false)} name="occupationEmployer" maxLength={80} value={form.occupationEmployer} onChange={handleChange} placeholder="Company name" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Present Position</label>
          <input className={fieldCls(false)} name="occupationPosition" maxLength={60} value={form.occupationPosition} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Company / Institution Address</label>
          <input className={fieldCls(false)} name="occupationCompanyAddress" maxLength={150} value={form.occupationCompanyAddress} onChange={handleChange} placeholder="Street address" />
        </div>
        <div>
          <label className="block mb-1 font-medium">City</label>
          <input className={fieldCls(false)} name="occupationCity" maxLength={70} value={form.occupationCity} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Province &amp; Postal Code</label>
          <input className={fieldCls(false)} name="occupationProvincePostal" maxLength={40} value={form.occupationProvincePostal} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Country</label>
          <input className={fieldCls(false)} name="occupationCountry" maxLength={60} value={form.occupationCountry} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Business / Work Phone</label>
          <input className={fieldCls(false)} name="occupationPhone" maxLength={20} value={form.occupationPhone} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Fax <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className={fieldCls(false)} name="occupationFax" maxLength={20} value={form.occupationFax} onChange={handleChange} />
        </div>
      </div>
    </SectionCard>
  );
}
