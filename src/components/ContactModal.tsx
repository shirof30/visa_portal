"use client";

import { useEffect } from "react";

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Contact Information
          </h2>
          <p className="text-sm text-gray-500">
            Konsulat Jenderal Republik Indonesia – Vancouver
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <ContactRow
            title="Consular & Immigration Services"
            phone="604-682-8855"
            ext="228"
          />

          <ContactRow
            title="Consular & Immigration Email"
            emails={["consular@indonesiavancouver.org", "paspor@indonesiavancouver.org"]}
          />


          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700 mb-1">
              Emergency Hotline (WNI)
            </p>
            <a
              href="tel:17787781992"
              className="text-red-800 font-semibold hover:underline"
            >
              778-788-1992
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-md
          border border-gray-300 bg-white
          py-2 text-sm font-semibold text-gray-700
          hover:bg-gray-100 transition
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"

        >
          Close
        </button>
      </div>
    </div>
  );
}

function ContactRow({
  title,
  phone,
  ext,
  emails,
}: {
  title: string;
  phone?: string;
  ext?: string;
  emails?: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="font-medium text-gray-900">{title}</p>

      {/* Phone */}
      {phone && (
        <p className="mt-1 text-gray-700">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="hover:underline"
          >
            {phone}
          </a>
          {ext && <span className="text-gray-500"> ext {ext}</span>}
        </p>
      )}

      {/* Emails */}
      {emails?.length ? (
        <div className={`${phone ? "mt-2" : "mt-1"} space-y-1`}>
          {emails.map((e) => (
            <a
              key={e}
              href={`mailto:${e}`}
              className="block text-gray-700 hover:underline break-all"
            >
              {e}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

