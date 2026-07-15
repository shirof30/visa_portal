"use client";
import React, { useEffect, useRef, useState } from "react";
import SectionCard from "../ui/SectionCard";
import FieldError from "../ui/FieldError";

const CA_PROVINCE_BY_CODE: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

type Suggestion = {
  placeId: string;
  text: string;
  // raw prediction object kept so we can call toPlace()
  prediction: any;
};

export default function CanadaAddressStep({ form, inv, fieldCls, handleChange, setForm }: {
  form: {
    addressCanadaStreet: string;
    addressCanadaCity: string;
    addressCanadaProvince: string;
    addressCanadaUnit: string;
    addressCanadaPostalCode: string;
    addressCanadaCountry: string;
    addressCanadaFax: string;
    addressCanadaCell: string;
    phoneNumber: string;
    email: string;
  };
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const sessionTokenRef = useRef<any>(null);
  const placesLibRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Lazily import the Places library once Maps JS is loaded.
  async function ensurePlacesLib() {
    if (placesLibRef.current) return placesLibRef.current;
    if (!window.google?.maps?.importLibrary) return null;
    const lib: any = await window.google.maps.importLibrary("places");
    placesLibRef.current = lib;
    return lib;
  }

  function newSessionToken(lib: any) {
    sessionTokenRef.current = new lib.AutocompleteSessionToken();
  }

  async function fetchSuggestions(input: string) {
    const lib = await ensurePlacesLib();
    if (!lib?.AutocompleteSuggestion) return;
    if (!sessionTokenRef.current) newSessionToken(lib);

    try {
      const request = {
        input,
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ["ca"],          // Canada-only
        includedPrimaryTypes: ["street_address", "premise", "subpremise"],
        language: "en",
        region: "ca",
      };
      const { suggestions: results } =
        await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      const mapped: Suggestion[] = (results ?? [])
        .filter((r: any) => r.placePrediction)
        .map((r: any) => {
          const p = r.placePrediction;
          // text is a FormattableText object; prefer .text.text, fall back to toString()
          const label = p.text?.text ?? p.text?.toString?.() ?? "";
          return { placeId: p.placeId, text: label, prediction: p };
        });

      setSuggestions(mapped);
      setOpen(mapped.length > 0);
      setActiveIdx(-1);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }

  function onStreetChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleChange(e);
    const v = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  }

  async function selectSuggestion(s: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents"] });

      let streetNumber = "", streetName = "", city = "", province = "", postalCode = "";
      for (const c of place.addressComponents ?? []) {
        const t = c.types;
        if (t.includes("street_number")) streetNumber = c.longText;
        if (t.includes("route")) streetName = c.longText;
        if (t.includes("locality")) city = c.longText;
        if (t.includes("administrative_area_level_1")) {
          const code = c.shortText?.toUpperCase() ?? "";
          province = CA_PROVINCE_BY_CODE[code] ?? c.longText;
        }
        if (t.includes("postal_code")) postalCode = c.longText;
      }

      const street = `${streetNumber} ${streetName}`.trim() || s.text;
      setForm((prev: any) => ({
        ...prev,
        addressCanadaStreet: street,
        addressCanadaCity: city,
        addressCanadaProvince: province,
        addressCanadaPostalCode: postalCode,
      }));
    } catch {
      // If detail fetch fails, at least drop the display text into the street field.
      setForm((prev: any) => ({ ...prev, addressCanadaStreet: s.text }));
    } finally {
      // Each selection ends a session; start fresh next time.
      sessionTokenRef.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeIdx >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <SectionCard title="13. Address (Mandatory)" subtitle="Your current residential address in Canada.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Street Address</label>
          <div ref={wrapRef} className="relative w-full">
            <input
              className={fieldCls(inv(!form.addressCanadaStreet.trim()))}
              name="addressCanadaStreet"
              maxLength={150}
              value={form.addressCanadaStreet}
              onChange={onStreetChange}
              onKeyDown={onKeyDown}
              onFocus={() => { if (suggestions.length) setOpen(true); }}
              placeholder="Start typing your address..."
              autoComplete="off"
              required
            />
            {open && suggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                {suggestions.map((s, idx) => (
                  <li
                    key={s.placeId}
                    role="option"
                    aria-selected={idx === activeIdx}
                    onMouseDown={(ev) => { ev.preventDefault(); selectSuggestion(s); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`cursor-pointer px-3 py-2 text-sm ${idx === activeIdx ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {s.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Start typing to auto-fill your address (Canada)</p>
          <FieldError show={inv(!form.addressCanadaStreet.trim())} message="Street address is required." />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">
            Unit / Apt / Suite <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className={fieldCls(false)}
            name="addressCanadaUnit"
            value={form.addressCanadaUnit}
            onChange={handleChange}
            placeholder="e.g. Unit 302, Apt 4B"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">City</label>
          <input
            className={fieldCls(inv(!form.addressCanadaCity.trim()))}
            name="addressCanadaCity"
            value={form.addressCanadaCity}
            maxLength={70}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.addressCanadaCity.trim())} message="City is required." />
        </div>

        <div>
          <label className="block mb-1 font-medium">Province</label>
          <input
            className={fieldCls(inv(!form.addressCanadaProvince.trim()))}
            name="addressCanadaProvince"
            value={form.addressCanadaProvince}
            maxLength={30}
            onBlur={(e) => {
              const raw = (e.target.value || "").trim();
              if (!raw) return;
              const upper = raw.toUpperCase();
              if (CA_PROVINCE_BY_CODE[upper]) {
                setForm((prev: any) => ({ ...prev, addressCanadaProvince: CA_PROVINCE_BY_CODE[upper] }));
                return;
              }
              const normalized = Object.values(CA_PROVINCE_BY_CODE).find(
                (x) => x.toLowerCase() === raw.toLowerCase()
              );
              if (normalized) {
                setForm((prev: any) => ({ ...prev, addressCanadaProvince: normalized }));
                return;
              }
              setForm((prev: any) => ({ ...prev, addressCanadaProvince: "" }));
            }}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.addressCanadaProvince.trim())} message="Province is required." />
        </div>

        <div>
          <label className="block mb-1 font-medium">Postal Code</label>
          <input
            className={fieldCls(inv(!form.addressCanadaPostalCode.trim()))}
            name="addressCanadaPostalCode"
            value={form.addressCanadaPostalCode}
            maxLength={7}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.addressCanadaPostalCode.trim())} message="Postal code is required." />
        </div>

        <div>
          <label className="block mb-1 font-medium">Country</label>
          <input
            className={fieldCls(false)}
            name="addressCanadaCountry"
            value={form.addressCanadaCountry}
            maxLength={60}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">Contact at this address</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="text"
              inputMode="numeric"
              className={fieldCls(inv(form.phoneNumber.replace(/\D/g, "").length !== 10))}
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={(e) =>
                handleChange({
                  target: { name: "phoneNumber", value: e.target.value.replace(/\D/g, "").slice(0, 10) },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
              placeholder="6041234567"
              required
            />
            <FieldError show={inv(form.phoneNumber.replace(/\D/g, "").length !== 10)} message="Phone number must be exactly 10 digits." />
          </div>
          <div>
            <label className="block mb-1 font-medium">Fax <span className="text-gray-400 font-normal">(optional)</span></label>
            <input className={fieldCls(false)} name="addressCanadaFax" value={form.addressCanadaFax} onChange={handleChange} maxLength={20} />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Cellular / Mobile <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input className={fieldCls(false)} name="addressCanadaCell" value={form.addressCanadaCell} onChange={handleChange} maxLength={20} placeholder="(604) 123-4567" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" className={fieldCls(inv(!form.email.trim()))} name="email" value={form.email} onChange={handleChange} maxLength={254} placeholder="your@email.com" required />
            <FieldError show={inv(!form.email.trim())} message="Email is required." />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
