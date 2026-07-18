"use client";

import { useTranslations } from "next-intl";

export default function ProcessingOverlay({
  open,
  title,
  subtitle,
  steps = [],
}: {
  open: boolean;
  title?: string;
  subtitle?: string;
  steps?: string[];
}) {
  const t = useTranslations("processing");
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-10 w-10 shrink-0 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h3 className="text-base font-extrabold tracking-tight text-gray-900">
                {resolvedTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{resolvedSubtitle}</p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="mt-0.5 text-base leading-none">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-900">{t("doNotCloseTitle")}</p>
              <p className="text-xs text-amber-700 mt-0.5">{t("doNotCloseBody")}</p>
            </div>
          </div>

          {steps.length > 0 && (
            <div className="mt-4 space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-[6px] inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                  <span className="leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[11px] text-gray-500">{t("footerNote")}</p>
        </div>
      </div>
    </div>
  );
}
