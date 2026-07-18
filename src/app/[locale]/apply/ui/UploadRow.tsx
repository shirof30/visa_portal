"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

export type UploadItem = {
  key: string;
  label: string;
  hint?: string;
  accept?: string;
  pdfOnly?: boolean;
  required?: boolean;
  sampleImage?: string;
};

function SampleModal({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const t = useTranslations("upload");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">{t("sampleTitle", { label })}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            aria-label={t("closeAria")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <img
          src={src}
          alt={t("sampleAlt", { label })}
          className="w-full rounded-lg border border-gray-200 object-contain max-h-[70vh]"
        />
        <p className="mt-2 text-center text-[11px] text-gray-400">{t("sampleNote")}</p>
      </div>
    </div>
  );
}

export default function UploadRow({
  item,
  file,
  onPick,
  missing,
}: {
  item: UploadItem;
  file: File | null | undefined;
  onPick: (file: File | null) => void;
  missing?: boolean;
}) {
  const t = useTranslations("upload");
  const tCommon = useTranslations("common");
  const [showSample, setShowSample] = useState(false);

  return (
    <>
      {showSample && item.sampleImage && (
        <SampleModal
          src={item.sampleImage}
          label={item.label}
          onClose={() => setShowSample(false)}
        />
      )}

      <div
        className={`flex flex-col gap-3 rounded-xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 bg-white ${
          missing ? "border-red-300" : "border-gray-200"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-700 break-words">
            {item.label}
            {item.required && <span className="text-red-500 ml-0.5">*</span>}
          </p>
          {item.hint && (
            <p className="text-[11px] text-gray-500 break-words">{item.hint}</p>
          )}
          {item.sampleImage && (
            <button
              type="button"
              onClick={() => setShowSample(true)}
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
            >
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t("viewSample")}
            </button>
          )}
          {missing && (
            <p className="mt-0.5 text-[11px] font-medium text-red-600 flex items-center gap-1">
              <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("requiredError")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:shrink-0 sm:justify-end">
          <label className="inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full border border-red-500 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-[0.99] transition">
            {tCommon("chooseFile")}
            <input
              type="file"
              className="hidden"
              accept={item.accept}
              required={item.required}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>

          <span className="min-w-0 text-xs text-gray-500 max-w-[60vw] truncate sm:max-w-[220px]">
            {file ? file.name : tCommon("noFileSelected")}
          </span>
        </div>
      </div>
    </>
  );
}
