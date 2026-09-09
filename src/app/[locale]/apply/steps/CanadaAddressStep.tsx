"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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

const PROVINCE_OPTIONS = Object.values(CA_PROVINCE_BY_CODE).sort((a, b) => a.localeCompare(b));

type Suggestion = {
  placeId: string;
  text: string;
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
  };
  inv: (cond: boolean) => boolean;
  fieldCls: (invalid: boolean, extra?: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  const t = useTranslations("applySteps.address");
  const tCommon = useTranslations("common");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const sessionTokenRef = useRef<any>(null);
  const placesLibRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
        includedRegionCodes: ["ca"],
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
        const types = c.types;
        if (types.includes("street_number")) streetNumber = c.longText;
        if (types.includes("route")) streetName = c.longText;
        if (types.includes("locality")) city = c.longText;
        if (types.includes("administrative_area_level_1")) {
          const code = c.shortText?.toUpperCase() ?? "";
          province = CA_PROVINCE_BY_CODE[code] ?? c.longText;
        }
        if (types.includes("postal_code")) postalCode = c.longText;
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
      setForm((prev: any) => ({ ...prev, addressCanadaStreet: s.text }));
    } finally {
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
    <SectionCard title={t("title")} subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">{t("streetAddress")}</label>
          <div ref={wrapRef} className="relative w-full">
            <input
              className={fieldCls(inv(!form.addressCanadaStreet.trim()))}
              name="addressCanadaStreet"
              maxLength={150}
              value={form.addressCanadaStreet}
              onChange={onStreetChange}
              onKeyDown={onKeyDown}
              onFocus={() => { if (suggestions.length) setOpen(true); }}
              placeholder={t("streetPlaceholder")}
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
          <p className="mt-1 text-[11px] text-gray-400">{t("streetHint")}</p>
          <FieldError show={inv(!form.addressCanadaStreet.trim())} message={t("errors.street")} />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">
            {t("unit")}{" "}
            <span className="text-gray-400 font-normal">{tCommon("optional")}</span>
          </label>
          <input
            className={fieldCls(false)}
            name="addressCanadaUnit"
            value={form.addressCanadaUnit}
            onChange={handleChange}
            placeholder={t("unitPlaceholder")}
            maxLength={20}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("city")}</label>
          <input
            className={fieldCls(inv(!form.addressCanadaCity.trim()))}
            name="addressCanadaCity"
            value={form.addressCanadaCity}
            maxLength={70}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.addressCanadaCity.trim())} message={t("errors.city")} />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("province")}</label>
          <select
            className={fieldCls(inv(!form.addressCanadaProvince.trim()))}
            name="addressCanadaProvince"
            value={form.addressCanadaProvince}
            onChange={handleChange}
            required
          >
            <option value="">{t("provincePlaceholder")}</option>
            {PROVINCE_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <FieldError show={inv(!form.addressCanadaProvince.trim())} message={t("errors.province")} />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("postalCode")}</label>
          <input
            className={fieldCls(inv(!form.addressCanadaPostalCode.trim()))}
            name="addressCanadaPostalCode"
            value={form.addressCanadaPostalCode}
            maxLength={7}
            onChange={handleChange}
            required
          />
          <FieldError show={inv(!form.addressCanadaPostalCode.trim())} message={t("errors.postalCode")} />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("country")}</label>
          <input
            className={fieldCls(false)}
            name="addressCanadaCountry"
            value={form.addressCanadaCountry}
            maxLength={60}
            onChange={handleChange}
          />
        </div>
      </div>
    </SectionCard>
  );
}
