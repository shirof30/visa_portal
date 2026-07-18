"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const MONTH_KEYS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export type DateSelectProps = {
  label: string;
  name: string;
  value: string; // YYYY-MM-DD
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  required?: boolean;
  disabled?: boolean;

  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD

  yearStart: number;
  yearEnd: number;

  className?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseYmd(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return { y: 0, mo: 0, d: 0 };
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) };
}

function isValidYmd(y: number, m: number, d: number) {
  if (!y || !m || !d) return false;
  if (m < 1 || m > 12) return false;
  const days = new Date(y, m, 0).getDate();
  return d >= 1 && d <= days;
}

function cmpDate(a: string, b: string) {
  if (!a || !b) return 0;
  return a < b ? -1 : a > b ? 1 : 0;
}

function clampToRange(value: string, min?: string, max?: string) {
  let v = value;
  if (min && cmpDate(v, min) < 0) v = min;
  if (max && cmpDate(v, max) > 0) v = max;
  return v;
}

export default function DateSelect({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
  min,
  max,
  yearStart,
  yearEnd,
  className,
}: DateSelectProps) {
  const t = useTranslations("dateSelect");
  const [draft, setDraft] = useState(() => parseYmd(value));

  useEffect(() => {
    setDraft(parseYmd(value));
  }, [value]);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let yr = yearEnd; yr >= yearStart; yr--) arr.push(yr);
    return arr;
  }, [yearStart, yearEnd]);

  const daysInMonth = useMemo(() => {
    const { y, mo } = draft;
    if (!y || !mo) return 31;
    return new Date(y, mo, 0).getDate();
  }, [draft]);

  const baseInputClass =
    "w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3.5 pr-8 py-2.5 text-base transition-all duration-150 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500";

  const disabledClass = disabled
    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
    : "";

  const selectClass = [baseInputClass, disabledClass, className]
    .filter(Boolean)
    .join(" ");

  const commitIfComplete = (next: { y: number; mo: number; d: number }) => {
    if (!isValidYmd(next.y, next.mo, next.d)) return;

    let nextValue = `${next.y}-${pad2(next.mo)}-${pad2(next.d)}`;
    nextValue = clampToRange(nextValue, min, max);

    const synthetic = {
      target: { name, value: nextValue },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(synthetic);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 font-medium">{label}</label>
      )}
      <div className="grid grid-cols-12 gap-2">

        <div className="col-span-4 relative">
          <select
            disabled={disabled}
            required={required}
            className={selectClass}
            value={draft.y || ""}
            onChange={(e) => {
              const nextY = Number(e.target.value || 0);
              const dim =
                nextY && draft.mo ? new Date(nextY, draft.mo, 0).getDate() : 31;
              const nextD = draft.d ? Math.min(draft.d, dim) : 0;

              const next = { y: nextY, mo: draft.mo, d: nextD };
              setDraft(next);
              commitIfComplete(next);
            }}
          >
            <option value="" disabled>
              {t("year")}
            </option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="col-span-4 relative">
          <select
            disabled={disabled}
            required={required}
            className={selectClass}
            value={draft.mo || ""}
            onChange={(e) => {
              const nextM = Number(e.target.value || 0);
              const dim =
                draft.y && nextM ? new Date(draft.y, nextM, 0).getDate() : 31;
              const nextD = draft.d ? Math.min(draft.d, dim) : 0;

              const next = { y: draft.y, mo: nextM, d: nextD };
              setDraft(next);
              commitIfComplete(next);
            }}
          >
            <option value="" disabled>
              {t("month")}
            </option>
            {MONTH_KEYS.map((monthKey, index) => {
              const monthNumber = index + 1;
              return (
                <option key={monthNumber} value={monthNumber}>
                  {t(`months.${monthKey}`)}
                </option>
              );
            })}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="col-span-4 relative">
          <select
            disabled={disabled}
            required={required}
            className={selectClass}
            value={draft.d || ""}
            onChange={(e) => {
              const nextD = Number(e.target.value || 0);

              const next = { y: draft.y, mo: draft.mo, d: nextD };
              setDraft(next);
              commitIfComplete(next);
            }}
          >
            <option value="" disabled>
              {t("day")}
            </option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {pad2(day)}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
