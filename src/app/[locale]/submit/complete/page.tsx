"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

function CompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("complete");
  const tCommon = useTranslations("common");
  const ref = searchParams.get("ref") ?? searchParams.get("id");

  const [appRef, setAppRef] = useState(ref ?? "");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!!ref);
  const [fullName, setFullName] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!ref) { setLoading(false); return; }
    fetch(`/api/submissions/public?ref=${encodeURIComponent(ref)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setAppRef(data.applicationRef ?? ref);
        setFullName(data.fullName ?? "");
        setReason(data.reason ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl px-4">

        <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl overflow-hidden mb-3">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />
          <div className="px-6 py-7 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{t("submittedBadge")}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              {t("subtitle")}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-emerald-700">{t("emailConfirmation")}</p>
            </div>
          </div>
        </div>

        {(fullName || reason) && (
          <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl overflow-hidden mb-3">
            <div className="bg-[#0d2b5e] px-6 py-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">{t("detailsTitle")}</span>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row gap-4">
              {fullName && (
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("applicantLabel")}</p>
                  <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                </div>
              )}
              {reason && (
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("visaTypeLabel")}</p>
                  <p className="text-sm font-semibold text-gray-800">{reason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl overflow-hidden mb-3">
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{t("refLabel")}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <span className="font-mono text-base font-bold text-gray-900 tracking-wide">{appRef}</span>
              </div>
              <button type="button" onClick={async () => {
                try {
                if (navigator.clipboard && window.isSecureContext) {
                  await navigator.clipboard.writeText(appRef);
                } else {
                  const ta = document.createElement("textarea");
                  ta.value = appRef; ta.style.position = "fixed"; ta.style.opacity = "0";
                  document.body.appendChild(ta); ta.focus(); ta.select();
                  document.execCommand("copy"); document.body.removeChild(ta);
                }
                setCopied(true); setTimeout(() => setCopied(false), 1500);
              } catch {}
              }} className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all cursor-pointer active:scale-[0.97] ${copied ? "bg-emerald-500 text-white" : "bg-[#0d2b5e] text-white hover:bg-[#0f3570]"}`}>
                {copied ? tCommon("copied") : tCommon("copy")}
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-amber-800"><span className="font-bold">{t("important")}</span> {t("refWarning")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl overflow-hidden mb-3">
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{t("nextStepsTitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { icon: "📋", titleKey: "reviewTitle", descKey: "reviewDesc" },
                { icon: "📞", titleKey: "contactTitle", descKey: "contactDesc" },
                { icon: "🏢", titleKey: "visitTitle", descKey: "visitDesc" },
              ] as const).map(({ icon, titleKey, descKey }) => (
                <div key={titleKey} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{t(`nextSteps.${titleKey}`)}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(`nextSteps.${descKey}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push("/check")} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
            {t("checkStatus")}
          </button>
          <button onClick={() => router.push("/")} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0d2b5e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f3570] transition cursor-pointer">
            {t("backHome")}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function CompletePage() {
  const tCommon = useTranslations("common");

  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="sr-only">{tCommon("loading")}</span>
      </div>
    }>
      <CompleteContent />
    </Suspense>
  );
}
