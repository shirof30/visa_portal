"use client";

import React, { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ApplicationStatus } from "@/lib/db";

type CheckResponse = {
  applicationRef: string;
  fullName: string;
  reason: string;
  status: ApplicationStatus;
  statusNote?: string;
  appointmentSlot: string | null;
  registrationId?: string;
  submissionMethod?: string | null;
};

function localeTag(locale: string) {
  return locale === "id" ? "id-ID" : "en-CA";
}

function formatSlotDate(slot: string | null, locale: string) {
  if (!slot) return null;
  const cleaned = slot.replace("Z", "");
  const date = new Date(cleaned.split("T")[0] + "T12:00:00");
  return date.toLocaleDateString(localeTag(locale), {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatSlotTime(slot: string | null) {
  if (!slot) return null;
  return slot.replace("Z", "").split("T")[1]?.slice(0, 5);
}

function isAppointmentLocked(slot: string | null): boolean {
  if (!slot) return true;
  const apptStr = new Date(slot).toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
  return apptStr <= todayStr;
}

function getDaysUntil(slot: string | null): number | null {
  if (!slot) return null;
  const [datePart] = slot.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const appt = new Date(year, month - 1, day);
  const todayVanStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
  const [ty, tm, td] = todayVanStr.split("-").map(Number);
  const today = new Date(Date.UTC(ty, tm - 1, td));
  return Math.round((appt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type StatusVisual = {
  icon: string;
  accent: string;
  accentLight: string;
  accentText: string;
};

const STATUS_VISUALS: Partial<Record<ApplicationStatus, StatusVisual>> = {
  "Permohonan diterima": {
    icon: "✓",
    accent: "#2563eb", accentLight: "#eff6ff", accentText: "#1d4ed8",
  },
  "Permohonan menunggu dokumen": {
    icon: "✉",
    accent: "#ea580c", accentLight: "#fff7ed", accentText: "#c2410c",
  },
  "Permohonan disetujui": {
    icon: "✓",
    accent: "#16a34a", accentLight: "#f0fdf4", accentText: "#15803d",
  },
  "Permohonan ditunda": {
    icon: "⏸",
    accent: "#d97706", accentLight: "#fffbeb", accentText: "#b45309",
  },
  "Permohonan ditolak": {
    icon: "✕",
    accent: "#dc2626", accentLight: "#fef2f2", accentText: "#b91c1c",
  },
  "Permohonan sedang proses cetak": {
    icon: "⬡",
    accent: "#7c3aed", accentLight: "#f5f3ff", accentText: "#6d28d9",
  },
  "Paspor selesai diproses": {
    icon: "★",
    accent: "#0891b2", accentLight: "#ecfeff", accentText: "#0e7490",
  },
};

function linkify(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#dc2626", textDecoration: "underline", wordBreak: "break-all" }}>{part}</a>
      : part
  );
}

export default function CheckPage() {
  const t = useTranslations("check");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [ref, setRef] = useState("");
  const [data, setData] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingDob, setVerifyingDob] = useState(false);
  const [resultKey, setResultKey] = useState(0);
  const router = useRouter();
  const canSubmit = useMemo(() => ref.trim().length >= 8, [ref]);

  const [showDobModal, setShowDobModal] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);
  const [pendingRef, setPendingRef] = useState("");
  const [pendingService, setPendingService] = useState("");

  function getStatusVariant(status: ApplicationStatus) {
    const visuals = STATUS_VISUALS[status];
    if (!visuals) {
      return {
        label: status,
        icon: "•",
        accent: "#64748b",
        accentLight: "#f8fafc",
        accentText: "#475569",
        nextStep: "",
      };
    }
    return {
      ...visuals,
      label: t(`statuses.${status}.label`),
      nextStep: t(`statuses.${status}.nextStep`),
    };
  }

  async function handleCheck() {
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch(`/api/check?ref=${encodeURIComponent(ref.trim())}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || t("errors.checkFailed")); return; }
      setResultKey(k => k + 1);
      setData(json as CheckResponse);
    } catch {
      setError(t("errors.checkRetry"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDobSubmit() {
    if (!dobInput) return;
    setVerifyingDob(true); setDobError(null);
    try {
      const verifyRes = await fetch("/api/submissions/verify-ref", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationRef: pendingRef, dateOfBirth: dobInput }),
      });
      const verifyJson = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) { setDobError(verifyJson.error || t("errors.verificationFailed")); return; }
      sessionStorage.setItem(`resched_dob_ref_${pendingRef}`, dobInput);
      sessionStorage.setItem(
        `resched_context_ref_${pendingRef}`,
        JSON.stringify({
          id: verifyJson.id,
          fullName: verifyJson.fullName ?? "",
          appointmentSlot: verifyJson.appointmentSlot ?? null,
        })
      );
      setShowDobModal(false);
      router.push(`/appointment?id=${encodeURIComponent(verifyJson.id)}&ref=${encodeURIComponent(pendingRef)}&mode=reschedule&service=${encodeURIComponent(pendingService)}`);
    } catch {
      setDobError(t("errors.verificationRetry"));
    } finally {
      setVerifyingDob(false);
    }
  }

  const variant = data ? getStatusVariant(data.status) : null;

  const slotDate = data ? formatSlotDate(data.appointmentSlot, locale) : null;
  const slotTime = data ? formatSlotTime(data.appointmentSlot) : null;
  const daysUntil = data ? getDaysUntil(data.appointmentSlot) : null;
  const locked = data ? isAppointmentLocked(data.appointmentSlot) : true;
  const hasNote = !!(data?.statusNote?.trim());
  const showReminder = !!(data?.appointmentSlot && daysUntil !== null && daysUntil >= 0 && daysUntil <= 7);
  const showMailInstructions = data?.status === "Permohonan menunggu dokumen" && data?.submissionMethod === "mail";

  const card: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#9ca3af",
    margin: "0 0 10px",
  };

  function formatDaysUntil(count: number) {
    if (count < 0) return t("daysPast");
    if (count === 0) return t("daysToday");
    if (count === 1) return t("daysTomorrow");
    return t("daysIn", { count });
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .fu { animation: fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .modal-card { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ padding: "36px 16px 96px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>

          <div style={{ ...card, padding: "20px 24px", marginBottom: 12, textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#dc2626" }}>
              {t("eyebrow")}
            </p>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a", fontFamily: "Georgia,serif", letterSpacing: "-0.02em" }}>
              {t("title")}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>
              {t("subtitle")}
            </p>
          </div>

          <div style={{ ...card, padding: 20, marginBottom: 12 }}>
            <p style={sectionLabel}>{t("refLabel")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  flex: 1, minWidth: 0, borderRadius: 10,
                  border: "1.5px solid #e5e7eb", background: "#f9fafb",
                  padding: "11px 14px", fontSize: 13, fontFamily: "monospace",
                  color: "#0f172a", transition: "all 0.15s",
                }}
                placeholder={t("refPlaceholder")}
                maxLength={19}
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase().trim().slice(0, 19))}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleCheck()}
                onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
              />
              <button
                onClick={handleCheck}
                disabled={loading || !canSubmit}
                style={{
                  flexShrink: 0, borderRadius: 10, border: "none",
                  background: !canSubmit ? "#fca5a5" : "#dc2626",
                  color: "white", padding: "11px 18px", fontSize: 13, fontWeight: 700,
                  cursor: !canSubmit ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
              >
                {loading
                  ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> {tCommon("checking")}</>
                  : t("checkButton")}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
                <span style={{ color: "#dc2626", flexShrink: 0 }}>⚠</span>
                <p style={{ margin: 0, fontSize: 12, color: "#b91c1c", lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", gap: 7 }}>
              <span style={{ color: "#cbd5e1", fontSize: 13, flexShrink: 0, marginTop: 1 }}>ℹ</span>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {t("forgotRef")}{" "}
                <a href={`mailto:consular@indonesiavancouver.org?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(t("emailBody"))}`}
                  style={{ color: "#dc2626", fontWeight: 600, textDecoration: "none" }}>
                  {t("emailUs")}
                </a>{" "}{t("forgotRefSuffix")}
              </p>
            </div>
          </div>

          {data && variant && (
            <div key={resultKey} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              <div className="fu" style={{ animationDelay: "0ms", ...card, borderColor: variant.accent + "33" }}>
                <div style={{ height: 4, background: variant.accent }} />
                <div style={{ padding: "18px 20px", background: variant.accentLight }}>
                  <p style={sectionLabel}>{t("statusSection")}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: variant.accent, color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, flexShrink: 0,
                        boxShadow: `0 4px 12px ${variant.accent}40`,
                      }}>
                        {variant.icon}
                      </div>
                      <span style={{ fontSize: 24, fontWeight: 800, color: variant.accentText, fontFamily: "Georgia,serif", letterSpacing: "-0.02em" }}>
                        {variant.label}
                      </span>
                    </div>
                    <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: variant.accent, opacity: 0.25, animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: variant.accent }} />
                    </div>
                  </div>
                  {variant.nextStep && (
                    <p style={{ margin: "14px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.65, paddingTop: 14, borderTop: `1px solid ${variant.accent}20` }}>
                      {variant.nextStep}
                    </p>
                  )}
                </div>
              </div>

              <div className="fu" style={{ animationDelay: "80ms", ...card }}>

                <div style={{ background: "#0d2b5e", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                    {t("appointmentSection")}
                  </p>
                  {data.appointmentSlot && daysUntil !== null && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      background: daysUntil < 0 ? "rgba(255,255,255,0.1)" : daysUntil === 0 ? "#dc2626" : daysUntil <= 3 ? "#f59e0b" : "rgba(255,255,255,0.15)",
                      color: (daysUntil > 0 && daysUntil <= 3) ? "#1a1200" : "white",
                    }}>
                      {formatDaysUntil(daysUntil)}
                    </span>
                  )}
                </div>

                {data.appointmentSlot ? (
                  <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b", textTransform: "capitalize", fontWeight: 500 }}>{slotDate}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 42, fontWeight: 900, color: "#0d2b5e", lineHeight: 1, letterSpacing: "-2px", fontFamily: "Georgia,serif" }}>
                        {slotTime}
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{t("localTime")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94a3b8" }}>
                        {t("location")}
                      </div>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          if (locked) return;
                          const applicationRef = data.applicationRef || "";
                          if (!applicationRef) { setError(t("errors.refUnavailable")); return; }
                          setPendingRef(applicationRef);
                          setPendingService(data.reason);
                          setDobInput("");
                          setDobError(null);
                          setShowDobModal(true);
                        }}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999,
                          border: locked ? "1px solid #f1f5f9" : "1.5px solid #cbd5e1",
                          background: "transparent",
                          color: locked ? "#d1d5db" : "#374151",
                          cursor: locked ? "not-allowed" : "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {locked ? t("locked") : t("reschedule")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "22px 20px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{t("noAppointment")}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#cbd5e1" }}>{t("noAppointmentHint")}</p>
                  </div>
                )}

                {([
                  { label: t("applicantName"), value: data.fullName, bold: true, mono: false },
                  { label: t("visaTypePurpose"), value: data.reason, bold: false, mono: false },
                  { label: t("referenceNo"), value: data.applicationRef, bold: false, mono: true },
                ] as const).map(({ label, value, bold, mono }, i, arr) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? "1px solid #f9fafb" : "none",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", flexShrink: 0 }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: mono ? 12 : 13,
                      fontWeight: bold ? 700 : 400,
                      color: bold ? "#0f172a" : "#374151",
                      fontFamily: mono ? "monospace" : "inherit",
                      textAlign: "right",
                      background: mono ? "#f1f5f9" : "transparent",
                      padding: mono ? "2px 8px" : 0,
                      borderRadius: mono ? 6 : 0,
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {hasNote && (
                <div className="fu" style={{ animationDelay: "160ms", ...card, borderColor: variant.accent + "33" }}>
                  <div style={{ height: 3, background: variant.accent }} />
                  <div style={{ padding: "16px 20px", background: variant.accentLight }}>
                    <p style={{ ...sectionLabel, color: variant.accentText }}>
                      {data.status === "Permohonan ditunda" ? t("noteLabels.actionRequired")
                        : data.status === "Permohonan ditolak" ? t("noteLabels.rejectionReason")
                          : t("noteLabels.staffNote")}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                      {linkify(data.statusNote!)}
                    </p>
                    {(data.status === "Permohonan ditunda" || data.status === "Permohonan ditolak") && (
                      <a href="mailto:consular@indonesiavancouver.org"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 700, color: "#dc2626", textDecoration: "none" }}>
                        {t("contactUs")}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {showMailInstructions && (
                <div className="fu" style={{ animationDelay: `${hasNote ? 240 : 160}ms`, ...card, background: "#fff7ed", borderColor: "#fed7aa" }}>
                  <div style={{ height: 3, background: "#ea580c" }} />
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ ...sectionLabel, color: "#9a3412", marginBottom: 14 }}>
                      {t("mailInstructionsTitle")}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {([
                        { icon: "📍", text: t("mailInstructionsAddress") },
                        { icon: "🔖", text: t("mailInstructionsRef") },
                        { icon: "↩️", text: t("mailInstructionsReturn") },
                      ] as const).map(({ icon, text }, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <p style={{ margin: 0, fontSize: 13, color: "#9a3412", lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showReminder && (
                <div className="fu" style={{ animationDelay: `${hasNote ? 240 : 160}ms`, ...card, background: "#f8faff", borderColor: "#bfdbfe" }}>
                  <div style={{ height: 3, background: "#0d2b5e" }} />
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ ...sectionLabel, color: "#1e3a5f", marginBottom: 14 }}>
                      {t("reminderTitle")}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {([
                        { icon: "🕐", text: t("reminderArrive") },
                        { icon: "📄", text: t("reminderDocuments") },
                        { icon: "📍", text: t("reminderAddress") },
                      ] as const).map(({ icon, text }, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <p style={{ margin: 0, fontSize: 13, color: "#1e3a5f", lineHeight: 1.6 }}>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {showDobModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDobModal(false); }}
        >
          <div className="modal-card" style={{
            background: "white", borderRadius: 20, padding: "32px 28px",
            width: "100%", maxWidth: 380,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "#fef2f2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 24,
            }}>
              🛡️
            </div>

            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#dc2626" }}>
              {t("dobModal.eyebrow")}
            </p>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "Georgia,serif" }}>
              {t("dobModal.title")}
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              {t("dobModal.subtitle")}
            </p>

            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af" }}>
                {t("dobModal.refLabel")}
              </p>
              <div style={{
                background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10,
                padding: "11px 14px", fontSize: 13, fontFamily: "monospace", color: "#64748b",
              }}>
                {data?.applicationRef}
              </div>
            </div>

            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af" }}>
                {t("dobModal.dobLabel")}
              </p>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => { setDobInput(e.target.value); setDobError(null); }}
                onKeyDown={(e) => e.key === "Enter" && dobInput && handleDobSubmit()}
                style={{
                  width: "100%", boxSizing: "border-box", borderRadius: 10,
                  border: `1.5px solid ${dobError ? "#fca5a5" : "#e5e7eb"}`,
                  background: "#f9fafb", padding: "11px 14px", fontSize: 13,
                  color: "#0f172a", outline: "none", transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = dobError ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
              {dobError && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#dc2626", textAlign: "left" }}>{dobError}</p>
              )}
            </div>

            <button
              disabled={verifyingDob || !dobInput}
              onClick={handleDobSubmit}
              style={{
                width: "100%", borderRadius: 12, border: "none",
                background: !dobInput ? "#fca5a5" : "#dc2626",
                color: "white", padding: "13px", fontSize: 14, fontWeight: 700,
                cursor: !dobInput ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 0.15s",
              }}
            >
              {verifyingDob
                ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> {tCommon("verifying")}</>
                : t("dobModal.continue")}
            </button>

            <button
              onClick={() => setShowDobModal(false)}
              style={{ marginTop: 12, background: "none", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", padding: "4px 8px" }}
            >
              {tCommon("cancel")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
