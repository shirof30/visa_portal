"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "@/lib/db";

type CheckResponse = {
  applicationRef: string;
  fullName: string;
  reason: string;
  status: ApplicationStatus;
  statusNote?: string;
  appointmentSlot: string | null;
  registrationId?: string;
};

function formatSlotDate(slot: string | null) {
  if (!slot) return null;
  const cleaned = slot.replace("Z", "");
  const date = new Date(cleaned.split("T")[0] + "T12:00:00");
  return date.toLocaleDateString("en-CA", {
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

type StatusVariant = {
  label: string;
  icon: string;
  accent: string;
  accentLight: string;
  accentText: string;
  nextStep: string;
};

const STATUS_MAP: Partial<Record<ApplicationStatus, StatusVariant>> = {
  "Permohonan diterima": {
    label: "Received", icon: "✓",
    accent: "#2563eb", accentLight: "#eff6ff", accentText: "#1d4ed8",
    nextStep: "Your application is being reviewed by our staff. Please still attend on your scheduled date.",
  },
  "Permohonan disetujui": {
    label: "Approved", icon: "✓",
    accent: "#16a34a", accentLight: "#f0fdf4", accentText: "#15803d",
    nextStep: "Your application has been approved. Please attend your scheduled appointment.",
  },
  "Permohonan ditunda": {
    label: "On Hold", icon: "⏸",
    accent: "#d97706", accentLight: "#fffbeb", accentText: "#b45309",
    nextStep: "Action is needed. Please read the note below and get in touch with us.",
  },
  "Permohonan ditolak": {
    label: "Rejected", icon: "✕",
    accent: "#dc2626", accentLight: "#fef2f2", accentText: "#b91c1c",
    nextStep: "Your application could not be processed. Contact us for more information.",
  },
  "Permohonan sedang proses cetak": {
    label: "Processing", icon: "⬡",
    accent: "#7c3aed", accentLight: "#f5f3ff", accentText: "#6d28d9",
    nextStep: "Your visa is being processed. We'll be in touch shortly.",
  },
  "Paspor selesai diproses": {
    label: "Ready", icon: "★",
    accent: "#0891b2", accentLight: "#ecfeff", accentText: "#0e7490",
    nextStep: "Your visa is ready for collection at our consular office.",
  },
};

function linkify(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#047857", textDecoration: "underline", wordBreak: "break-all" }}>{part}</a>
      : part
  );
}

/** Animates a number counting up from 0 once it mounts. Purely cosmetic. */
function CountUp({ value, durationMs = 700 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

export default function CheckPage() {
  const [ref, setRef] = useState("");
  const [data, setData] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingDob, setVerifyingDob] = useState(false);
  const [resultKey, setResultKey] = useState(0);
  const router = useRouter();
  const canSubmit = useMemo(() => ref.trim().length >= 8, [ref]);

  // Modal state
  const [showDobModal, setShowDobModal] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);
  const [pendingRef, setPendingRef] = useState("");
  const [pendingService, setPendingService] = useState("");

  async function handleCheck() {
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch(`/api/check?ref=${encodeURIComponent(ref.trim())}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Couldn't check your application. Please try again."); return; }
      setResultKey(k => k + 1);
      setData(json as CheckResponse);
    } catch {
      setError("Couldn't check your application. Please try again.");
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
      if (!verifyRes.ok) { setDobError(verifyJson.error || "Verification failed."); return; }
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
      setDobError("Verification failed. Please try again.");
    } finally {
      setVerifyingDob(false);
    }
  }

  const variant = data
    ? (STATUS_MAP[data.status] ?? {
      label: data.status, icon: "•",
      accent: "#64748b", accentLight: "#f8fafc", accentText: "#475569",
      nextStep: "",
    })
    : null;

  const slotDate = data ? formatSlotDate(data.appointmentSlot) : null;
  const slotTime = data ? formatSlotTime(data.appointmentSlot) : null;
  const daysUntil = data ? getDaysUntil(data.appointmentSlot) : null;
  const locked = data ? isAppointmentLocked(data.appointmentSlot) : true;
  const hasNote = !!(data?.statusNote?.trim());
  const showReminder = !!(data?.appointmentSlot && daysUntil !== null && daysUntil >= 0 && daysUntil <= 7);

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

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardSettle {
          0%   { opacity: 0; transform: translateY(18px) rotate(-1.4deg) scale(0.98); }
          60%  { opacity: 1; transform: translateY(-2px) rotate(0.3deg) scale(1.005); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes stampThunk {
          0%   { opacity: 0; transform: scale(1.9) rotate(-18deg); }
          55%  { opacity: 1; transform: scale(0.94) rotate(3deg); }
          75%  { transform: scale(1.05) rotate(-1.5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
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
        @keyframes driftBg {
          from { background-position: 0 0; }
          to   { background-position: 120px 120px; }
        }
        .fu { animation: fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .settle { animation: cardSettle 0.55s cubic-bezier(0.2,0.9,0.25,1.05) both; }
        .stamp { animation: stampThunk 0.62s cubic-bezier(0.2,0.8,0.2,1) both; }
        .modal-card { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        input:focus { outline: none; }
        .press:active { transform: scale(0.97); }
        .bg-security {
          background-image: repeating-linear-gradient(135deg, rgba(4,120,87,0.05) 0px, rgba(4,120,87,0.05) 1px, transparent 1px, transparent 14px);
          animation: driftBg 14s linear infinite;
        }
        .ticket-notch { position: relative; }
        .ticket-notch::before, .ticket-notch::after {
          content: ""; position: absolute; width: 20px; height: 20px; border-radius: 50%;
          background: #f4f6f5; top: 50%; transform: translateY(-50%); z-index: 2;
        }
        .ticket-notch::before { left: -10px; }
        .ticket-notch::after { right: -10px; }
        .ticket-tear {
          background-image: repeating-linear-gradient(to right, #e2e8f0 0, #e2e8f0 6px, transparent 6px, transparent 13px);
          height: 1px;
        }
        .barcode {
          background-image: repeating-linear-gradient(to right, #0f172a 0px, #0f172a 2px, transparent 2px, transparent 5px, #0f172a 5px, #0f172a 6px, transparent 6px, transparent 10px);
          opacity: 0.55;
        }
        @media (max-width: 380px) {
          .slot-time { font-size: 34px !important; }
        }
      `}</style>

      <div className="bg-security" style={{ padding: "36px 16px 96px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>

          {/* Title */}
          <div style={{ ...card, padding: "22px 24px", marginBottom: 12, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L9 21l-1-4-4-1 1.5-1.5M12 15L21 6a2 2 0 00-2-2l-9 9m3 3L6 9m6 6l7 3-3-7" />
              </svg>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#047857" }}>
                KJRI Vancouver · Visa Services
              </p>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a", fontFamily: "Georgia,serif", letterSpacing: "-0.02em" }}>
              Check Application Status
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Enter your visa application reference number
            </p>
          </div>

          {/* Search */}
          <div style={{ ...card, padding: 20, marginBottom: 12 }}>
            <p style={sectionLabel}>Reference Number</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  flex: 1, minWidth: 0, borderRadius: 10,
                  border: "1.5px solid #e5e7eb", background: "#f9fafb",
                  padding: "11px 14px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.05em",
                  color: "#0f172a", transition: "all 0.15s",
                }}
                placeholder="APP-20260108-ABCD12"
                maxLength={19}
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase().trim().slice(0, 19))}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleCheck()}
                onFocus={(e) => { e.target.style.borderColor = "#047857"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(4,120,87,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
              />
              <button
                className="press"
                onClick={handleCheck}
                disabled={loading || !canSubmit}
                style={{
                  flexShrink: 0, borderRadius: 10, border: "none",
                  background: !canSubmit ? "#a7d5c4" : "#047857",
                  color: "white", padding: "11px 18px", fontSize: 13, fontWeight: 700,
                  cursor: !canSubmit ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                  transition: "background 0.15s, transform 0.1s",
                }}
              >
                {loading
                  ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Checking</>
                  : "Check →"}
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
                Forgot your reference number?{" "}
                <a href={`mailto:consular@indonesiavancouver.org?subject=${encodeURIComponent("Visa Application Reference Number Request")}&body=${encodeURIComponent("Hello,\n\nI've forgotten my visa application's reference number. Could you please help me look it up?\n\nFull name: [Your name]\n\nThank you.")}`}
                  style={{ color: "#047857", fontWeight: 600, textDecoration: "none" }}>
                  Email us
                </a>{" "}with your full name.
              </p>
            </div>
          </div>

          {/* Results */}
          {data && variant && (
            <div key={resultKey} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* 1 — Status */}
              <div className="settle" style={{ animationDelay: "0ms", ...card, borderColor: variant.accent + "33" }}>
                <div style={{ height: 4, background: variant.accent }} />
                <div style={{ padding: "18px 20px", background: variant.accentLight }}>
                  <p style={sectionLabel}>Application Status</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="stamp" style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: variant.accent, color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, flexShrink: 0,
                        boxShadow: `0 4px 12px ${variant.accent}40`,
                        border: `2px solid ${variant.accent}`,
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

              {/* 2 — Appointment ticket */}
              <div className="settle" style={{ animationDelay: "80ms", ...card, position: "relative" }}>

                <div style={{ background: "#022c22", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                    Appointment
                  </p>
                  {data.appointmentSlot && daysUntil !== null && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      background: daysUntil < 0 ? "rgba(255,255,255,0.12)" : daysUntil === 0 ? "#dc2626" : daysUntil <= 3 ? "#f59e0b" : "rgba(255,255,255,0.18)",
                      color: (daysUntil > 0 && daysUntil <= 3) ? "#1a1200" : "white",
                    }}>
                      {daysUntil < 0 ? "Past" : daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : <>in <CountUp value={daysUntil} /> days</>}
                    </span>
                  )}
                </div>

                {data.appointmentSlot ? (
                  <>
                    <div style={{ padding: "18px 20px 14px" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b", textTransform: "capitalize", fontWeight: 500 }}>{slotDate}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                        <span className="slot-time" style={{ fontSize: 42, fontWeight: 900, color: "#022c22", lineHeight: 1, letterSpacing: "-2px", fontFamily: "Georgia,serif" }}>
                          {slotTime}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>local time</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94a3b8" }}>
                          <span>📍</span> 1630 Alberni St, Vancouver
                        </div>
                        <button
                          type="button"
                          className="press"
                          disabled={locked}
                          onClick={() => {
                            if (locked) return;
                            const applicationRef = data.applicationRef || "";
                            if (!applicationRef) { setError("Reference number is not available."); return; }
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
                          {locked ? "Locked" : "Reschedule →"}
                        </button>
                      </div>
                    </div>
                    <div className="ticket-notch">
                      <div className="ticket-tear" />
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "22px 20px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No appointment scheduled yet</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#cbd5e1" }}>A schedule will be available once your application is processed</p>
                  </div>
                )}

                {([
                  { label: "Applicant Name", value: data.fullName, bold: true, mono: false },
                  { label: "Visa Type / Purpose", value: data.reason, bold: false, mono: false },
                  { label: "Reference No.", value: data.applicationRef, bold: false, mono: true },
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
                <div className="barcode" style={{ height: 10, margin: "2px 20px 14px" }} />
              </div>

              {/* 3 — Note */}
              {hasNote && (
                <div className="fu" style={{ animationDelay: "220ms", ...card, borderColor: variant.accent + "33" }}>
                  <div style={{ height: 3, background: variant.accent }} />
                  <div style={{ padding: "16px 20px", background: variant.accentLight }}>
                    <p style={{ ...sectionLabel, color: variant.accentText }}>
                      {data.status === "Permohonan ditunda" ? "⚠ Action Required"
                        : data.status === "Permohonan ditolak" ? "✕ Reason for Rejection"
                          : "📝 Note from Staff"}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                      {linkify(data.statusNote!)}
                    </p>
                    {(data.status === "Permohonan ditunda" || data.status === "Permohonan ditolak") && (
                      <a href="mailto:consular@indonesiavancouver.org"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 700, color: "#047857", textDecoration: "none" }}>
                        Contact us →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 4 — Reminder */}
              {showReminder && (
                <div className="fu" style={{ animationDelay: `${hasNote ? 300 : 220}ms`, ...card, background: "#f5fbf8", borderColor: "#a7d5c4" }}>
                  <div style={{ height: 3, background: "#047857" }} />
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ ...sectionLabel, color: "#022c22", marginBottom: 14 }}>
                      📋 Arrival Reminder
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {([
                        { icon: "🕐", text: <span>Please arrive <strong>10–15 minutes</strong> before your scheduled time</span> },
                        { icon: "📄", text: <span>Bring your original passport and any supporting documents you submitted</span> },
                        { icon: "📍", text: <span>1630 Alberni St, Vancouver, BC V6G 1A6</span> },
                        { icon: "👔", text: <span>Dress neatly — collared shirt, any colour <strong>other than white</strong></span> },
                      ] as const).map(({ icon, text }, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <p style={{ margin: 0, fontSize: 13, color: "#022c22", lineHeight: 1.6 }}>{text}</p>
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

      {/* ── DOB Verification Modal ── */}
      {showDobModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(2,20,15,0.55)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDobModal(false); }}
        >
          <div className="modal-card" style={{
            background: "white", borderRadius: 20, padding: "32px 28px",
            width: "100%", maxWidth: 380,
            boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            textAlign: "center",
          }}>
            {/* Shield icon */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 24,
            }}>
              🛡️
            </div>

            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#047857" }}>
              KJRI Vancouver
            </p>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "Georgia,serif" }}>
              Identity Verification
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              Enter your date of birth to access the reschedule page.
            </p>

            {/* Ref number (read-only) */}
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af" }}>
                Reference Number
              </p>
              <div style={{
                background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10,
                padding: "11px 14px", fontSize: 13, fontFamily: "monospace", color: "#64748b",
              }}>
                {data?.applicationRef}
              </div>
            </div>

            {/* DOB input */}
            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af" }}>
                Date of Birth
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
                onFocus={(e) => { e.target.style.borderColor = "#047857"; e.target.style.boxShadow = "0 0 0 3px rgba(4,120,87,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = dobError ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
              {dobError && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#dc2626", textAlign: "left" }}>{dobError}</p>
              )}
            </div>

            {/* Submit */}
            <button
              className="press"
              disabled={verifyingDob || !dobInput}
              onClick={handleDobSubmit}
              style={{
                width: "100%", borderRadius: 12, border: "none",
                background: !dobInput ? "#a7d5c4" : "#047857",
                color: "white", padding: "13px", fontSize: 14, fontWeight: 700,
                cursor: !dobInput ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 0.15s, transform 0.1s",
              }}
            >
              {verifyingDob
                ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Verifying…</>
                : "Continue →"}
            </button>

            <button
              className="press"
              onClick={() => setShowDobModal(false)}
              style={{ marginTop: 12, background: "none", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", padding: "4px 8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
