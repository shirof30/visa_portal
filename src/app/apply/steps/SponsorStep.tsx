import React from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

export default function SponsorStep({
  form,
  required,
  inv,
  fieldCls,
  handleChange,
}: {
  form: {
    sponsorName: string;
    sponsorPosition: string;
    sponsorCompany: string;
    sponsorAddress: string;
    sponsorCityProvincePostal: string;
    sponsorPhone: string;
    sponsorFax: string;
  };
  required: boolean; // true when the applicant indicated they have an Invitation/Reference Letter
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <SectionCard
      title="19. Contact Person/Sponsor in Indonesia"
      subtitle={
        required
          ? "Required — you indicated you have an Invitation/Reference Letter. Complete the fields marked with *."
          : "Optional — fill in if you have a contact person or sponsor in Indonesia."
      }
    >
      {required && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          Please complete the fields marked with <span className="text-red-600 font-semibold">*</span>.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            Full Name{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            className={fieldCls(inv(required && !form.sponsorName.trim()))}
            name="sponsorName"
            maxLength={80}
            value={form.sponsorName}
            onChange={handleChange}
          />
          <FieldError show={inv(required && !form.sponsorName.trim())} message="Sponsor name is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">Position / Title</label>
          <input className={fieldCls(false)} name="sponsorPosition" maxLength={60} value={form.sponsorPosition} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Company{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            className={fieldCls(inv(required && !form.sponsorCompany.trim()))}
            name="sponsorCompany"
            maxLength={80}
            value={form.sponsorCompany}
            onChange={handleChange}
          />
          <FieldError show={inv(required && !form.sponsorCompany.trim())} message="Company is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Phone{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="tel"
            className={fieldCls(inv(required && !form.sponsorPhone.trim()))}
            name="sponsorPhone"
            maxLength={15}
            value={form.sponsorPhone}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "sponsorPhone",
                  value: e.target.value.replace(/[^0-9+\-() ]/g, "").slice(0, 15),
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder="+62..."
          />
          <FieldError show={inv(required && !form.sponsorPhone.trim())} message="Sponsor phone is required." />
        </div>
        <div>
          <label className="block mb-1 font-medium">Fax <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className={fieldCls(false)} name="sponsorFax" maxLength={20} value={form.sponsorFax} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">City, Province &amp; Post Code</label>
          <input className={fieldCls(false)} name="sponsorCityProvincePostal" maxLength={100} value={form.sponsorCityProvincePostal} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">
          Address{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          className={fieldCls(inv(required && !form.sponsorAddress.trim()))}
          name="sponsorAddress"
          maxLength={200}
          value={form.sponsorAddress}
          onChange={handleChange}
          placeholder="Street address"
        />
        <FieldError show={inv(required && !form.sponsorAddress.trim())} message="Sponsor address is required." />
      </div>
    </SectionCard>
  );
}
