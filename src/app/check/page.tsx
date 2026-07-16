"use client";

import React, { useEffect, useMemo, useState } from "react";
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

type StatusVariant = {
  label: string;
  eyebrow: string;
  icon: IconName;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  nextStep: string;
};

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "clock"
  | "document"
  | "info"
  | "location"
  | "lock"
  | "mail"
  | "pause"
  | "print"
  | "search"
  | "shield"
  | "sparkles"
  | "user"
  | "warning"
  | "x";

const STATUS_MAP: Partial<Record<ApplicationStatus, StatusVariant>> = {
  "Permohonan diterima": {
    label: "Application Received",
    eyebrow: "Under review",
    icon: "document",
    accent: "#4f8cff",
    accentSoft: "rgba(79, 140, 255, 0.14)",
    accentGlow: "rgba(79, 140, 255, 0.32)",
    nextStep:
      "Your application has been received and is currently being reviewed by a consular officer. Please keep your appointment as scheduled.",
  },
  "Permohonan disetujui": {
    label: "Application Approved",
    eyebrow: "Approved",
    icon: "check",
    accent: "#2bd99f",
    accentSoft: "rgba(43, 217, 159, 0.14)",
    accentGlow: "rgba(43, 217, 159, 0.3)",
    nextStep:
      "Your application has been approved. Please attend your appointment at the scheduled date and time.",
  },
  "Permohonan ditunda": {
    label: "Action Required",
    eyebrow: "On hold",
    icon: "pause",
    accent: "#ffb547",
    accentSoft: "rgba(255, 181, 71, 0.15)",
    accentGlow: "rgba(255, 181, 71, 0.3)",
    nextStep:
      "Additional information or action is required before we can continue. Review the officer's note below and contact us if needed.",
  },
  "Permohonan ditolak": {
    label: "Application Declined",
    eyebrow: "Not approved",
    icon: "x",
    accent: "#ff647c",
    accentSoft: "rgba(255, 100, 124, 0.14)",
    accentGlow: "rgba(255, 100, 124, 0.3)",
    nextStep:
      "We are unable to continue processing this application. Review the officer's note below or contact the consular team for assistance.",
  },
  "Permohonan sedang proses cetak": {
    label: "Document in Production",
    eyebrow: "Final processing",
    icon: "print",
    accent: "#a778ff",
    accentSoft: "rgba(167, 120, 255, 0.14)",
    accentGlow: "rgba(167, 120, 255, 0.3)",
    nextStep:
      "Your document is now in production. We will notify you when it is ready for collection.",
  },
  "Paspor selesai diproses": {
    label: "Ready for Collection",
    eyebrow: "Completed",
    icon: "sparkles",
    accent: "#38c9e8",
    accentSoft: "rgba(56, 201, 232, 0.14)",
    accentGlow: "rgba(56, 201, 232, 0.3)",
    nextStep:
      "Your document has been completed and is ready for collection at the Consulate General.",
  },
};

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h5" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );
    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M9 7v10M15 7v10" />
        </svg>
      );
    case "print":
      return (
        <svg {...common}>
          <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" />
          <rect x="7" y="14" width="10" height="7" rx="1" />
          <path d="M17 11h.01" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3z" />
          <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
          <path d="m5 14 .6 1.4L7 16l-1.4.6L5 18l-.6-1.4L3 16l1.4-.6z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M10.3 4.2 2.7 17.4A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.6L13.7 4.2a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
  }
}

function formatSlotDate(slot: string | null) {
  if (!slot) return null;
  const datePart = slot.replace("Z", "").split("T")[0];
  const date = new Date(`${datePart}T12:00:00`);

  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSlotTime(slot: string | null) {
  if (!slot) return null;
  return slot.replace("Z", "").split("T")[1]?.slice(0, 5) ?? null;
}

function isAppointmentLocked(slot: string | null): boolean {
  if (!slot) return true;

  const appointmentDate = new Date(slot).toLocaleDateString("en-CA", {
    timeZone: "America/Vancouver",
  });
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Vancouver",
  });

  return appointmentDate <= today;
}

function getDaysUntil(slot: string | null): number | null {
  if (!slot) return null;

  const [datePart] = slot.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const appointment = new Date(Date.UTC(year, month - 1, day));
  const todayVancouver = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Vancouver",
  });
  const [todayYear, todayMonth, todayDay] = todayVancouver.split("-").map(Number);
  const today = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay));

  return Math.round(
    (appointment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getCountdownLabel(daysUntil: number) {
  if (daysUntil < 0) return "Appointment passed";
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `${daysUntil} days away`;
}

function translateApiError(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const normalized = value.toLowerCase();

  if (
    normalized.includes("tidak ditemukan") ||
    normalized.includes("not found") ||
    normalized.includes("tidak terdaftar")
  ) {
    return "No application was found for that reference number. Please check it and try again.";
  }

  if (
    normalized.includes("tanggal lahir") ||
    normalized.includes("date of birth") ||
    normalized.includes("dob")
  ) {
    return "The date of birth does not match this application.";
  }

  if (
    normalized.includes("nomor referensi") ||
    normalized.includes("reference") ||
    normalized.includes("format")
  ) {
    return "Please enter a valid application reference number.";
  }

  return fallback;
}

function translateServiceName(reason: string) {
  const normalized = reason.trim().toLowerCase();
  const translations: Record<string, string> = {
    "visa kunjungan": "Visit Visa",
    "visa tinggal terbatas": "Limited Stay Visa",
    "visa diplomatik": "Diplomatic Visa",
    "visa dinas": "Service Visa",
    "permohonan visa": "Visa Application",
    "perpanjangan visa": "Visa Extension",
  };

  return translations[normalized] ?? reason;
}

function linkify(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) =>
    /^https?:\/\//i.test(part) ? (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-link"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function CheckPage() {
  const [reference, setReference] = useState("");
  const [data, setData] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingDob, setVerifyingDob] = useState(false);
  const [resultKey, setResultKey] = useState(0);

  const [showDobModal, setShowDobModal] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);
  const [pendingRef, setPendingRef] = useState("");
  const [pendingService, setPendingService] = useState("");

  const router = useRouter();
  const canSubmit = useMemo(() => reference.trim().length >= 8, [reference]);

  useEffect(() => {
    if (!showDobModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowDobModal(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showDobModal]);

  async function handleCheck() {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/api/check?ref=${encodeURIComponent(reference.trim())}`,
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fallback =
          response.status === 404
            ? "No application was found for that reference number. Please check it and try again."
            : "We could not retrieve your application right now. Please try again.";

        setError(translateApiError(json?.error, fallback));
        return;
      }

      setResultKey((key) => key + 1);
      setData(json as CheckResponse);
    } catch {
      setError(
        "We could not connect to the application service. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDobSubmit() {
    if (!dobInput || verifyingDob) return;

    setVerifyingDob(true);
    setDobError(null);

    try {
      const response = await fetch("/api/submissions/verify-ref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationRef: pendingRef,
          dateOfBirth: dobInput,
        }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDobError(
          translateApiError(
            json?.error,
            "We could not verify your identity. Check the date of birth and try again.",
          ),
        );
        return;
      }

      sessionStorage.setItem(`resched_dob_ref_${pendingRef}`, dobInput);
      sessionStorage.setItem(
        `resched_context_ref_${pendingRef}`,
        JSON.stringify({
          id: json.id,
          fullName: json.fullName ?? "",
          appointmentSlot: json.appointmentSlot ?? null,
        }),
      );

      setShowDobModal(false);
      router.push(
        `/appointment?id=${encodeURIComponent(json.id)}&ref=${encodeURIComponent(
          pendingRef,
        )}&mode=reschedule&service=${encodeURIComponent(pendingService)}`,
      );
    } catch {
      setDobError(
        "We could not verify your identity right now. Please try again.",
      );
    } finally {
      setVerifyingDob(false);
    }
  }

  const variant = data
    ? (STATUS_MAP[data.status] ?? {
      label: "Application Update",
      eyebrow: "Current status",
      icon: "info" as IconName,
      accent: "#8ca0bb",
      accentSoft: "rgba(140, 160, 187, 0.14)",
      accentGlow: "rgba(140, 160, 187, 0.25)",
      nextStep: "Please review the latest update provided for your application.",
    })
    : null;

  const slotDate = data ? formatSlotDate(data.appointmentSlot) : null;
  const slotTime = data ? formatSlotTime(data.appointmentSlot) : null;
  const daysUntil = data ? getDaysUntil(data.appointmentSlot) : null;
  const locked = data ? isAppointmentLocked(data.appointmentSlot) : true;
  const hasNote = Boolean(data?.statusNote?.trim());
  const showReminder = Boolean(
    data?.appointmentSlot &&
    daysUntil !== null &&
    daysUntil >= 0 &&
    daysUntil <= 7,
  );

  return (
    <>
      <style>{`
        @keyframes aurora-one {
          0%, 100% { transform: translate3d(-8%, -4%, 0) rotate(-8deg) scale(1); }
          50% { transform: translate3d(12%, 8%, 0) rotate(7deg) scale(1.12); }
        }

        @keyframes aurora-two {
          0%, 100% { transform: translate3d(8%, 8%, 0) rotate(8deg) scale(1.08); }
          50% { transform: translate3d(-12%, -6%, 0) rotate(-9deg) scale(.96); }
        }

        @keyframes grid-drift {
          from { transform: translateY(0); }
          to { transform: translateY(48px); }
        }

        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -11px, 0); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px) scale(.985); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes result-enter {
          from { opacity: 0; transform: translateY(28px) scale(.975); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(.82); opacity: .75; }
          75%, 100% { transform: scale(2.15); opacity: 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-140%) skewX(-18deg); }
          60%, 100% { transform: translateX(240%) skewX(-18deg); }
        }

        @keyframes scan {
          0% { transform: translateY(-110%); opacity: 0; }
          12% { opacity: .6; }
          80% { opacity: .25; }
          100% { transform: translateY(600%); opacity: 0; }
        }

        @keyframes modal-in {
          from { opacity: 0; transform: translateY(20px) scale(.955); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .visa-check-page,
        .visa-check-page * {
          box-sizing: border-box;
        }

        .visa-check-page {
          --mouse-x: 50%;
          --mouse-y: 22%;
          position: relative;
          min-height: auto;
          overflow-x: hidden;
          overflow-y: visible;
          padding: clamp(28px, 5vw, 72px) 16px 96px;
          color: #eef4ff;
          background:
            radial-gradient(
              circle at var(--mouse-x) var(--mouse-y),
              rgba(61, 124, 255, 0.14),
              transparent 24rem
            ),
            linear-gradient(145deg, #03050a 0%, #07101f 42%, #050812 100%);
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          isolation: isolate;
        }

        .background-grid {
          position: absolute;
          inset: -48px 0;
          z-index: -4;
          opacity: .3;
          background-image:
            linear-gradient(rgba(147, 174, 224, .07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 174, 224, .07) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black 5%, transparent 86%);
          animation: grid-drift 16s linear infinite;
        }

        .background-noise {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");
        }

        .aurora {
          position: absolute;
          z-index: -3;
          width: min(56rem, 80vw);
          height: min(38rem, 60vw);
          border-radius: 50%;
          filter: blur(80px);
          opacity: .28;
          pointer-events: none;
          will-change: transform;
        }

        .aurora-one {
          top: -16rem;
          left: -15rem;
          background: linear-gradient(130deg, #1b68ff, #6337ff 55%, transparent 78%);
          animation: aurora-one 18s ease-in-out infinite;
        }

        .aurora-two {
          top: 10rem;
          right: -22rem;
          background: linear-gradient(145deg, #00c2ff, #1d52ff 50%, #d733ff);
          animation: aurora-two 22s ease-in-out infinite;
        }

        .shell {
          position: relative;
          width: min(100%, 760px);
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: clamp(32px, 6vw, 66px);
          animation: fade-up .8s cubic-bezier(.16, 1, .3, 1) both;
        }

        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-mark {
          position: relative;
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          flex: 0 0 auto;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, .15);
          border-radius: 15px;
          color: white;
          background:
            radial-gradient(circle at 30% 18%, rgba(255,255,255,.32), transparent 35%),
            linear-gradient(145deg, #f32845, #a60925);
          box-shadow: 0 14px 36px rgba(224, 32, 65, .28), inset 0 1px rgba(255,255,255,.2);
        }

        .brand-mark::after {
          content: "";
          position: absolute;
          inset: -30% auto -30% -55%;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: shimmer 4.4s ease-in-out infinite;
        }

        .brand-kicker,
        .brand-title,
        .security-copy,
        .hero-eyebrow,
        .hero-title,
        .hero-copy,
        .field-label,
        .helper-copy,
        .status-kicker,
        .status-title,
        .status-copy,
        .section-kicker,
        .appointment-date,
        .appointment-time,
        .appointment-zone,
        .detail-label,
        .detail-value,
        .note-title,
        .note-copy,
        .reminder-title,
        .reminder-copy,
        .modal-kicker,
        .modal-title,
        .modal-copy,
        .modal-label,
        .modal-error {
          margin: 0;
        }

        .brand-kicker {
          color: #8190aa;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .18em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .brand-title {
          overflow: hidden;
          color: #f7faff;
          font-size: 13px;
          font-weight: 760;
          letter-spacing: -.015em;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .security-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid rgba(123, 159, 220, .16);
          border-radius: 999px;
          color: #9badc9;
          background: rgba(9, 16, 30, .46);
          box-shadow: inset 0 1px rgba(255,255,255,.04);
          backdrop-filter: blur(16px);
        }

        .security-copy {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .hero {
          position: relative;
          margin-bottom: 28px;
          text-align: center;
          animation: fade-up .9s .08s cubic-bezier(.16, 1, .3, 1) both;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 7px 11px;
          border: 1px solid rgba(125, 161, 225, .14);
          border-radius: 999px;
          color: #a9b9d2;
          background: rgba(14, 25, 45, .46);
          box-shadow: inset 0 1px rgba(255,255,255,.04);
          backdrop-filter: blur(16px);
        }

        .hero-badge-dot {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #46d9ad;
          box-shadow: 0 0 12px rgba(70, 217, 173, .75);
        }

        .hero-badge-dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: inherit;
          animation: pulse-ring 2s ease-out infinite;
        }

        .hero-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .hero-title {
          margin-inline: auto;
          max-width: 680px;
          color: #f8fbff;
          font-size: clamp(40px, 7vw, 70px);
          font-weight: 780;
          letter-spacing: -.065em;
          line-height: .99;
          text-wrap: balance;
        }

        .hero-title span {
          color: transparent;
          background: linear-gradient(100deg, #ffffff 4%, #a8c7ff 46%, #d5bcff 86%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .hero-copy {
          max-width: 560px;
          margin: 18px auto 0;
          color: #8f9eb6;
          font-size: clamp(14px, 2vw, 16px);
          line-height: 1.75;
          text-wrap: balance;
        }

        .glass-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(132, 163, 218, .14);
          border-radius: 26px;
          background:
            linear-gradient(145deg, rgba(16, 28, 51, .82), rgba(7, 13, 25, .78));
          box-shadow:
            0 30px 90px rgba(0, 0, 0, .36),
            inset 0 1px rgba(255,255,255,.055),
            inset 0 -1px rgba(0,0,0,.24);
          backdrop-filter: blur(24px) saturate(125%);
        }

        .glass-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,.045), transparent 30% 70%, rgba(90,132,218,.04));
        }

        .search-card {
          padding: clamp(18px, 4vw, 28px);
          animation: fade-up .95s .16s cubic-bezier(.16, 1, .3, 1) both;
        }

        .search-card::after {
          content: "";
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(146,182,255,.7), transparent);
          opacity: .55;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
          color: #aebbd0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .search-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }

        .input-shell {
          position: relative;
          min-width: 0;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 16px;
          display: grid;
          place-items: center;
          color: #72829d;
          transform: translateY(-50%);
          pointer-events: none;
          transition: color .25s ease, transform .25s ease;
        }

        .reference-input,
        .date-input {
          width: 100%;
          border: 1px solid rgba(132, 161, 211, .16);
          border-radius: 16px;
          outline: none;
          color: #f5f8ff;
          background: rgba(3, 8, 17, .55);
          box-shadow: inset 0 1px 10px rgba(0,0,0,.18);
          transition: border-color .25s ease, box-shadow .25s ease, background .25s ease, transform .25s ease;
        }

        .reference-input {
          height: 58px;
          padding: 0 18px 0 49px;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 14px;
          font-weight: 650;
          letter-spacing: .045em;
          text-transform: uppercase;
        }

        .reference-input::placeholder {
          color: #4e5c73;
          font-weight: 550;
        }

        .reference-input:hover,
        .date-input:hover {
          border-color: rgba(139, 172, 229, .3);
        }

        .reference-input:focus,
        .date-input:focus {
          border-color: rgba(93, 145, 255, .8);
          background: rgba(5, 12, 25, .78);
          box-shadow: 0 0 0 4px rgba(73, 126, 246, .12), 0 14px 42px rgba(6, 25, 63, .2);
        }

        .input-shell:focus-within .input-icon {
          color: #78a7ff;
          transform: translateY(-50%) scale(1.06);
        }

        .primary-button,
        .secondary-button,
        .modal-primary-button,
        .modal-cancel-button {
          -webkit-tap-highlight-color: transparent;
          border: 0;
          font: inherit;
        }

        .primary-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-width: 154px;
          height: 58px;
          overflow: hidden;
          padding: 0 20px;
          border-radius: 16px;
          color: white;
          background:
            radial-gradient(circle at 30% 0%, rgba(255,255,255,.24), transparent 32%),
            linear-gradient(135deg, #336fff, #5d43ee 58%, #8039dc);
          box-shadow: 0 16px 40px rgba(64, 91, 238, .28), inset 0 1px rgba(255,255,255,.28);
          cursor: pointer;
          font-size: 13px;
          font-weight: 780;
          letter-spacing: -.01em;
          transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, filter .25s ease, opacity .25s ease;
        }

        .primary-button::before,
        .modal-primary-button::before {
          content: "";
          position: absolute;
          inset: -40% auto -40% -55%;
          width: 42%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          transform: skewX(-18deg);
          transition: transform .7s cubic-bezier(.16, 1, .3, 1);
        }

        .primary-button:hover:not(:disabled),
        .modal-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: saturate(1.12) brightness(1.05);
          box-shadow: 0 22px 52px rgba(64, 91, 238, .4), inset 0 1px rgba(255,255,255,.28);
        }

        .primary-button:hover:not(:disabled)::before,
        .modal-primary-button:hover:not(:disabled)::before {
          transform: translateX(430%) skewX(-18deg);
        }

        .primary-button:active:not(:disabled),
        .modal-primary-button:active:not(:disabled) {
          transform: translateY(0) scale(.98);
        }

        .primary-button:disabled,
        .modal-primary-button:disabled {
          opacity: .43;
          cursor: not-allowed;
          box-shadow: none;
          filter: saturate(.55);
        }

        .button-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,.28);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .65s linear infinite;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 13px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 100, 124, .24);
          border-radius: 14px;
          color: #ffb5c0;
          background: rgba(113, 18, 39, .2);
          animation: fade-up .35s cubic-bezier(.16,1,.3,1) both;
        }

        .error-box p {
          margin: 0;
          font-size: 12px;
          line-height: 1.55;
        }

        .helper-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(125, 158, 215, .1);
          color: #7788a4;
        }

        .helper-copy {
          font-size: 12px;
          line-height: 1.7;
        }

        .helper-link,
        .inline-link,
        .contact-link {
          color: #8db2ff;
          font-weight: 750;
          text-decoration: none;
          transition: color .2s ease, text-shadow .2s ease;
        }

        .helper-link:hover,
        .inline-link:hover,
        .contact-link:hover {
          color: #c3d7ff;
          text-shadow: 0 0 18px rgba(126, 174, 255, .4);
        }

        .results-stack {
          display: grid;
          gap: 14px;
          margin-top: 16px;
        }

        .result-card {
          animation: result-enter .7s var(--delay, 0ms) cubic-bezier(.16, 1, .3, 1) both;
        }

        .status-card {
          overflow: visible;
          padding: 1px;
          border: 0;
          background: linear-gradient(135deg, var(--status-accent), rgba(255,255,255,.12) 28%, rgba(255,255,255,.035) 56%, var(--status-accent));
          box-shadow: 0 30px 95px rgba(0,0,0,.38), 0 0 55px var(--status-glow);
        }

        .status-card-inner {
          position: relative;
          overflow: hidden;
          padding: clamp(22px, 5vw, 34px);
          border-radius: 25px;
          background:
            radial-gradient(circle at 88% 10%, var(--status-soft), transparent 38%),
            linear-gradient(145deg, rgba(14, 25, 47, .97), rgba(5, 11, 22, .96));
        }

        .status-card-inner::before {
          content: "";
          position: absolute;
          inset: -20% 0 auto;
          height: 34%;
          background: linear-gradient(to bottom, transparent, var(--status-soft), transparent);
          animation: scan 5.6s ease-in-out infinite;
          pointer-events: none;
        }

        .status-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .status-identity {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 16px;
        }

        .status-icon {
          position: relative;
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          flex: 0 0 auto;
          border: 1px solid color-mix(in srgb, var(--status-accent) 55%, white 12%);
          border-radius: 19px;
          color: white;
          background:
            radial-gradient(circle at 28% 18%, rgba(255,255,255,.32), transparent 36%),
            var(--status-accent);
          box-shadow: 0 16px 38px var(--status-glow), inset 0 1px rgba(255,255,255,.24);
          animation: float 4.8s ease-in-out infinite;
        }

        .status-kicker {
          margin-bottom: 5px;
          color: color-mix(in srgb, var(--status-accent) 78%, white 22%);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .status-title {
          color: #f7faff;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 780;
          letter-spacing: -.045em;
          line-height: 1.12;
          text-wrap: balance;
        }

        .live-indicator {
          position: relative;
          width: 10px;
          height: 10px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: var(--status-accent);
          box-shadow: 0 0 18px var(--status-accent);
        }

        .live-indicator::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: inherit;
          animation: pulse-ring 1.9s ease-out infinite;
        }

        .status-copy {
          position: relative;
          margin-top: 20px;
          padding-top: 19px;
          border-top: 1px solid color-mix(in srgb, var(--status-accent) 16%, transparent);
          color: #9cabc1;
          font-size: 13px;
          line-height: 1.75;
        }

        .appointment-card {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(260px, .82fr);
          min-height: 318px;
        }

        .appointment-visual {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          overflow: hidden;
          padding: clamp(22px, 5vw, 32px);
          border-right: 1px solid rgba(126, 158, 211, .11);
          background:
            radial-gradient(circle at 72% 20%, rgba(78, 127, 255, .18), transparent 35%),
            linear-gradient(145deg, rgba(13, 34, 71, .78), rgba(6, 17, 35, .68));
        }

        .appointment-visual::before {
          content: "";
          position: absolute;
          right: -120px;
          bottom: -140px;
          width: 300px;
          height: 300px;
          border: 46px solid rgba(85, 130, 245, .07);
          border-radius: 50%;
          box-shadow: 0 0 0 38px rgba(85,130,245,.035), 0 0 0 76px rgba(85,130,245,.018);
        }

        .section-kicker {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8193b0;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .countdown-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          margin-top: 20px;
          padding: 7px 11px;
          border: 1px solid rgba(137, 171, 230, .16);
          border-radius: 999px;
          color: #c3d4ef;
          background: rgba(5, 12, 25, .36);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .02em;
          backdrop-filter: blur(14px);
        }

        .countdown-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #66a0ff;
          box-shadow: 0 0 12px rgba(102,160,255,.8);
        }

        .appointment-date {
          position: relative;
          margin-top: 24px;
          color: #bac8db;
          font-size: 14px;
          font-weight: 560;
          line-height: 1.5;
          text-transform: capitalize;
        }

        .time-row {
          position: relative;
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-top: 2px;
        }

        .appointment-time {
          color: #f8fbff;
          font-size: clamp(52px, 10vw, 80px);
          font-weight: 760;
          letter-spacing: -.075em;
          line-height: 1;
          text-shadow: 0 18px 55px rgba(75, 125, 255, .22);
        }

        .appointment-zone {
          color: #71839f;
          font-size: 11px;
          font-weight: 650;
        }

        .appointment-location {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 24px;
          color: #8fa1bb;
          font-size: 12px;
          line-height: 1.5;
        }

        .empty-appointment {
          position: relative;
          display: grid;
          align-content: center;
          min-height: 205px;
        }

        .empty-appointment .appointment-time {
          margin-top: 18px;
          font-size: clamp(28px, 5vw, 40px);
          letter-spacing: -.045em;
        }

        .empty-appointment .appointment-date {
          max-width: 380px;
          margin-top: 12px;
          color: #7f8fa8;
        }

        .details-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          padding: clamp(22px, 5vw, 30px);
        }

        .detail-list {
          display: grid;
          gap: 0;
        }

        .detail-row {
          padding: 15px 0;
          border-bottom: 1px solid rgba(130, 160, 210, .095);
        }

        .detail-row:first-child {
          padding-top: 2px;
        }

        .detail-row:last-child {
          border-bottom: 0;
        }

        .detail-label {
          margin-bottom: 6px;
          color: #667892;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .detail-value {
          overflow-wrap: anywhere;
          color: #e9effa;
          font-size: 13px;
          font-weight: 620;
          line-height: 1.55;
        }

        .detail-value.mono {
          display: inline-flex;
          width: fit-content;
          padding: 5px 8px;
          border: 1px solid rgba(137, 169, 221, .1);
          border-radius: 8px;
          color: #b9c9df;
          background: rgba(5, 11, 22, .46);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 11px;
          letter-spacing: .04em;
        }

        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 44px;
          margin-top: 18px;
          padding: 10px 14px;
          border: 1px solid rgba(130, 164, 224, .18);
          border-radius: 13px;
          color: #baceee;
          background: rgba(14, 28, 52, .5);
          cursor: pointer;
          font-size: 11px;
          font-weight: 760;
          transition: transform .22s ease, color .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
        }

        .secondary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: rgba(111, 159, 255, .42);
          color: white;
          background: rgba(29, 57, 105, .56);
          box-shadow: 0 12px 32px rgba(24, 61, 131, .18);
        }

        .secondary-button:disabled {
          color: #4f5d72;
          background: rgba(10, 18, 31, .35);
          cursor: not-allowed;
          opacity: .72;
        }

        .note-card,
        .reminder-card {
          padding: clamp(20px, 4vw, 28px);
        }

        .note-card {
          border-color: color-mix(in srgb, var(--status-accent) 24%, transparent);
          background:
            radial-gradient(circle at 100% 0%, var(--status-soft), transparent 32%),
            linear-gradient(145deg, rgba(16,28,51,.86), rgba(7,13,25,.8));
        }

        .note-heading,
        .reminder-heading {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .small-icon-box {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border: 1px solid rgba(137, 172, 231, .13);
          border-radius: 12px;
          color: var(--small-accent, #83a9ff);
          background: var(--small-soft, rgba(71, 115, 213, .14));
          box-shadow: inset 0 1px rgba(255,255,255,.05);
        }

        .note-title,
        .reminder-title {
          color: #eff4fc;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: -.015em;
        }

        .note-copy,
        .reminder-copy {
          margin-top: 9px;
          color: #94a4bb;
          font-size: 13px;
          line-height: 1.75;
          white-space: pre-wrap;
        }

        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          font-size: 12px;
        }

        .reminder-card {
          background:
            radial-gradient(circle at 100% 0%, rgba(54, 109, 255, .14), transparent 32%),
            linear-gradient(145deg, rgba(15, 29, 53, .88), rgba(7, 14, 27, .82));
        }

        .reminder-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 20px;
        }

        .reminder-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
          padding: 14px;
          border: 1px solid rgba(132, 164, 218, .1);
          border-radius: 14px;
          background: rgba(4, 10, 21, .35);
        }

        .reminder-item-icon {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          flex: 0 0 auto;
          border-radius: 9px;
          color: #8db2ff;
          background: rgba(72, 119, 224, .13);
        }

        .reminder-item p {
          margin: 0;
          color: #96a5bb;
          font-size: 11.5px;
          line-height: 1.65;
        }

        .reminder-item strong {
          color: #dce6f7;
          font-weight: 750;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 18px;
          background: rgba(1, 4, 10, .76);
          backdrop-filter: blur(18px) saturate(115%);
          animation: backdrop-in .25s ease both;
        }

        .modal-card {
          position: relative;
          width: min(100%, 430px);
          overflow: hidden;
          padding: 1px;
          border-radius: 27px;
          background: linear-gradient(145deg, rgba(124, 162, 231, .45), rgba(255,255,255,.08), rgba(80, 105, 163, .2));
          box-shadow: 0 40px 120px rgba(0,0,0,.62), 0 0 80px rgba(47,87,183,.15);
          animation: modal-in .42s cubic-bezier(.16,1,.3,1) both;
        }

        .modal-inner {
          position: relative;
          padding: clamp(24px, 6vw, 34px);
          border-radius: 26px;
          background:
            radial-gradient(circle at 82% 2%, rgba(65, 111, 230, .18), transparent 35%),
            linear-gradient(145deg, #101b30, #080f1e 65%, #07101d);
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(132, 163, 216, .12);
          border-radius: 11px;
          color: #71819a;
          background: rgba(5,11,22,.4);
          cursor: pointer;
          transition: color .2s ease, background .2s ease, transform .2s ease;
        }

        .modal-close:hover {
          color: white;
          background: rgba(22,39,70,.65);
          transform: rotate(4deg);
        }

        .modal-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin-bottom: 20px;
          border: 1px solid rgba(91, 142, 255, .3);
          border-radius: 19px;
          color: #dce8ff;
          background:
            radial-gradient(circle at 30% 18%, rgba(255,255,255,.22), transparent 35%),
            linear-gradient(145deg, #275acf, #5632bb);
          box-shadow: 0 18px 46px rgba(45, 82, 191, .32), inset 0 1px rgba(255,255,255,.2);
          animation: float 4.5s ease-in-out infinite;
        }

        .modal-kicker {
          margin-bottom: 7px;
          color: #7da6ff;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .modal-title {
          color: #f7faff;
          font-size: 25px;
          font-weight: 770;
          letter-spacing: -.04em;
          line-height: 1.16;
        }

        .modal-copy {
          margin-top: 10px;
          color: #8494ab;
          font-size: 13px;
          line-height: 1.7;
        }

        .modal-form {
          display: grid;
          gap: 16px;
          margin-top: 25px;
        }

        .modal-label {
          margin-bottom: 8px;
          color: #7d8ea7;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .reference-readonly {
          width: 100%;
          min-height: 50px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          border: 1px solid rgba(130, 160, 211, .13);
          border-radius: 14px;
          color: #aebed4;
          background: rgba(4, 9, 18, .42);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          letter-spacing: .045em;
        }

        .date-input {
          height: 50px;
          padding: 0 14px;
          font-size: 13px;
          color-scheme: dark;
        }

        .modal-error {
          margin-top: 8px;
          color: #ff8799;
          font-size: 11px;
          line-height: 1.55;
        }

        .modal-primary-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 51px;
          overflow: hidden;
          margin-top: 4px;
          border-radius: 15px;
          color: white;
          background:
            radial-gradient(circle at 30% 0%, rgba(255,255,255,.22), transparent 35%),
            linear-gradient(135deg, #326eff, #6040e7 58%, #7d37d0);
          box-shadow: 0 18px 44px rgba(63, 87, 226, .3), inset 0 1px rgba(255,255,255,.25);
          cursor: pointer;
          font-size: 13px;
          font-weight: 780;
          transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, filter .25s ease, opacity .25s ease;
        }

        .modal-cancel-button {
          justify-self: center;
          padding: 7px 10px;
          color: #6f8099;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
          transition: color .2s ease;
        }

        .modal-cancel-button:hover {
          color: #bcc9dc;
        }

        @media (max-width: 700px) {
          .visa-check-page {
            padding-top: 22px;
          }

          .topbar {
            margin-bottom: 42px;
          }

          .security-copy {
            display: none;
          }

          .security-pill {
            width: 34px;
            justify-content: center;
            padding: 0;
          }

          .search-row {
            grid-template-columns: 1fr;
          }

          .primary-button {
            width: 100%;
          }

          .appointment-card {
            grid-template-columns: 1fr;
          }

          .appointment-visual {
            min-height: 278px;
            border-right: 0;
            border-bottom: 1px solid rgba(126, 158, 211, .11);
          }

          .details-panel {
            padding-top: 24px;
          }

          .reminder-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 440px) {
          .brand-kicker {
            display: none;
          }

          .brand-title {
            max-width: 220px;
            font-size: 12px;
          }

          .hero-title {
            font-size: 42px;
          }

          .status-topline {
            align-items: flex-start;
          }

          .status-identity {
            align-items: flex-start;
          }

          .status-icon {
            width: 50px;
            height: 50px;
            border-radius: 16px;
          }

          .appointment-time {
            font-size: 56px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .visa-check-page *,
          .visa-check-page *::before,
          .visa-check-page *::after {
            scroll-behavior: auto !important;
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .001ms !important;
          }
        }
      `}</style>

      <main
        className="visa-check-page"
        onPointerMove={(event) => {
          const target = event.currentTarget;
          const rect = target.getBoundingClientRect();
          target.style.setProperty(
            "--mouse-x",
            `${((event.clientX - rect.left) / rect.width) * 100}%`,
          );
          target.style.setProperty(
            "--mouse-y",
            `${((event.clientY - rect.top) / rect.height) * 100}%`,
          );
        }}
      >
        <div className="background-grid" aria-hidden="true" />
        <div className="background-noise" aria-hidden="true" />
        <div className="aurora aurora-one" aria-hidden="true" />
        <div className="aurora aurora-two" aria-hidden="true" />

        <div className="shell">
          <header className="topbar">
            <div className="brand-lockup">
              <div className="brand-mark">
                <Icon name="shield" size={22} strokeWidth={2} />
              </div>
              <div>
                <p className="brand-kicker">Consular Online Services</p>
                <p className="brand-title">Consulate General of Indonesia · Vancouver</p>
              </div>
            </div>

            <div className="security-pill" aria-label="Secure application portal">
              <Icon name="lock" size={13} strokeWidth={2} />
              <span className="security-copy">Secure portal</span>
            </div>
          </header>

          <section className="hero">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <p className="hero-eyebrow">Live application tracking</p>
            </div>
            <h1 className="hero-title">
              Track your visa <span>application.</span>
            </h1>
            <p className="hero-copy">
              Enter your application reference to view the latest status,
              appointment information, and any action required from you.
            </p>
          </section>

          <section className="glass-card search-card" aria-label="Application status search">
            <label className="field-label" htmlFor="application-reference">
              <Icon name="document" size={14} />
              Application reference
            </label>

            <div className="search-row">
              <div className="input-shell">
                <span className="input-icon">
                  <Icon name="search" size={18} />
                </span>
                <input
                  id="application-reference"
                  className="reference-input"
                  placeholder="APP-20260108-ABCD12"
                  maxLength={19}
                  autoComplete="off"
                  spellCheck={false}
                  value={reference}
                  onChange={(event) =>
                    setReference(
                      event.target.value
                        .toUpperCase()
                        .replace(/\s/g, "")
                        .slice(0, 19),
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canSubmit) void handleCheck();
                  }}
                  aria-describedby={error ? "application-error" : undefined}
                />
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => void handleCheck()}
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Checking
                  </>
                ) : (
                  <>
                    Check status
                    <Icon name="arrow" size={16} strokeWidth={2.1} />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div id="application-error" className="error-box" role="alert">
                <Icon name="warning" size={17} />
                <p>{error}</p>
              </div>
            )}

            <div className="helper-row">
              <Icon name="info" size={15} />
              <p className="helper-copy">
                Cannot find your reference number?{" "}
                <a
                  className="helper-link"
                  href={`mailto:consular@indonesiavancouver.org?subject=${encodeURIComponent(
                    "Request for Visa Application Reference Number",
                  )}&body=${encodeURIComponent(
                    "Hello,\n\nI am unable to locate my visa application reference number. Could you please help me retrieve it?\n\nFull name: [Your full name]\nDate of birth: [YYYY-MM-DD]\n\nThank you.",
                  )}`}
                >
                  Email the consular team
                </a>{" "}
                with your full name and date of birth.
              </p>
            </div>
          </section>

          {data && variant && (
            <section
              key={resultKey}
              className="results-stack"
              aria-live="polite"
              aria-label="Application status result"
            >
              <article
                className="glass-card status-card result-card"
                style={
                  {
                    "--delay": "0ms",
                    "--status-accent": variant.accent,
                    "--status-soft": variant.accentSoft,
                    "--status-glow": variant.accentGlow,
                  } as React.CSSProperties
                }
              >
                <div className="status-card-inner">
                  <div className="status-topline">
                    <div className="status-identity">
                      <div className="status-icon">
                        <Icon name={variant.icon} size={27} strokeWidth={2.1} />
                      </div>
                      <div>
                        <p className="status-kicker">{variant.eyebrow}</p>
                        <h2 className="status-title">{variant.label}</h2>
                      </div>
                    </div>
                    <span className="live-indicator" aria-hidden="true" />
                  </div>

                  <p className="status-copy">{variant.nextStep}</p>
                </div>
              </article>

              <article
                className="glass-card appointment-card result-card"
                style={{ "--delay": "90ms" } as React.CSSProperties}
              >
                <div className="appointment-visual">
                  {data.appointmentSlot ? (
                    <>
                      <div>
                        <p className="section-kicker">
                          <Icon name="calendar" size={14} />
                          Appointment
                        </p>

                        {daysUntil !== null && (
                          <div className="countdown-pill">
                            <span className="countdown-dot" />
                            {getCountdownLabel(daysUntil)}
                          </div>
                        )}

                        <p className="appointment-date">{slotDate}</p>
                        <div className="time-row">
                          <p className="appointment-time">{slotTime}</p>
                          <p className="appointment-zone">Vancouver time</p>
                        </div>
                      </div>

                      <div className="appointment-location">
                        <Icon name="location" size={16} />
                        <span>1630 Alberni Street, Vancouver, BC</span>
                      </div>
                    </>
                  ) : (
                    <div className="empty-appointment">
                      <p className="section-kicker">
                        <Icon name="calendar" size={14} />
                        Appointment
                      </p>
                      <p className="appointment-time">Not scheduled yet</p>
                      <p className="appointment-date">
                        Appointment details will appear here once your application
                        has reached the scheduling stage.
                      </p>
                    </div>
                  )}
                </div>

                <div className="details-panel">
                  <div className="detail-list">
                    <div className="detail-row">
                      <p className="detail-label">Applicant</p>
                      <p className="detail-value">{data.fullName}</p>
                    </div>
                    <div className="detail-row">
                      <p className="detail-label">Service</p>
                      <p className="detail-value">
                        {translateServiceName(data.reason)}
                      </p>
                    </div>
                    <div className="detail-row">
                      <p className="detail-label">Reference number</p>
                      <p className="detail-value mono">{data.applicationRef}</p>
                    </div>
                  </div>

                  {data.appointmentSlot && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={locked}
                      onClick={() => {
                        if (locked) return;

                        const applicationRef = data.applicationRef || "";
                        if (!applicationRef) {
                          setError("The application reference number is unavailable.");
                          return;
                        }

                        setPendingRef(applicationRef);
                        setPendingService(data.reason);
                        setDobInput("");
                        setDobError(null);
                        setShowDobModal(true);
                      }}
                    >
                      <Icon name={locked ? "lock" : "calendar"} size={14} />
                      {locked ? "This appointment cannot be changed" : "Reschedule appointment"}
                      {!locked && <Icon name="arrow" size={14} />}
                    </button>
                  )}
                </div>
              </article>

              {hasNote && (
                <article
                  className="glass-card note-card result-card"
                  style={
                    {
                      "--delay": "180ms",
                      "--status-accent": variant.accent,
                      "--status-soft": variant.accentSoft,
                    } as React.CSSProperties
                  }
                >
                  <div className="note-heading">
                    <div
                      className="small-icon-box"
                      style={
                        {
                          "--small-accent": variant.accent,
                          "--small-soft": variant.accentSoft,
                        } as React.CSSProperties
                      }
                    >
                      <Icon
                        name={
                          data.status === "Permohonan ditunda" ||
                            data.status === "Permohonan ditolak"
                            ? "warning"
                            : "document"
                        }
                        size={18}
                      />
                    </div>
                    <div>
                      <h3 className="note-title">
                        {data.status === "Permohonan ditunda"
                          ? "Action required"
                          : data.status === "Permohonan ditolak"
                            ? "Decision details"
                            : "Officer's note"}
                      </h3>
                      <p className="note-copy">{linkify(data.statusNote!)}</p>

                      {(data.status === "Permohonan ditunda" ||
                        data.status === "Permohonan ditolak") && (
                          <a
                            className="contact-link"
                            href="mailto:consular@indonesiavancouver.org"
                          >
                            <Icon name="mail" size={14} />
                            Contact the consular team
                            <Icon name="arrow" size={13} />
                          </a>
                        )}
                    </div>
                  </div>
                </article>
              )}

              {showReminder && (
                <article
                  className="glass-card reminder-card result-card"
                  style={
                    {
                      "--delay": hasNote ? "270ms" : "180ms",
                    } as React.CSSProperties
                  }
                >
                  <div className="reminder-heading">
                    <div
                      className="small-icon-box"
                      style={
                        {
                          "--small-accent": "#78a7ff",
                          "--small-soft": "rgba(72, 119, 224, .14)",
                        } as React.CSSProperties
                      }
                    >
                      <Icon name="sparkles" size={18} />
                    </div>
                    <div>
                      <h3 className="reminder-title">Appointment checklist</h3>
                      <p className="reminder-copy">
                        A few essentials to help your visit go smoothly.
                      </p>
                    </div>
                  </div>

                  <div className="reminder-grid">
                    <div className="reminder-item">
                      <div className="reminder-item-icon">
                        <Icon name="clock" size={14} />
                      </div>
                      <p>
                        Arrive <strong>10–15 minutes early</strong> for check-in.
                      </p>
                    </div>

                    <div className="reminder-item">
                      <div className="reminder-item-icon">
                        <Icon name="document" size={14} />
                      </div>
                      <p>
                        Bring your original passport, if available, and original
                        immigration document.
                      </p>
                    </div>

                    <div className="reminder-item">
                      <div className="reminder-item-icon">
                        <Icon name="location" size={14} />
                      </div>
                      <p>1630 Alberni Street, Vancouver, BC V6G 1A6.</p>
                    </div>

                    <div className="reminder-item">
                      <div className="reminder-item-icon">
                        <Icon name="user" size={14} />
                      </div>
                      <p>
                        Wear neat, respectful clothing with a collar; avoid white
                        clothing for the photo.
                      </p>
                    </div>
                  </div>
                </article>
              )}
            </section>
          )}
        </div>
      </main>

      {showDobModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowDobModal(false);
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-verification-title"
          >
            <div className="modal-inner">
              <button
                type="button"
                className="modal-close"
                aria-label="Close identity verification"
                onClick={() => setShowDobModal(false)}
              >
                <Icon name="x" size={16} />
              </button>

              <div className="modal-icon">
                <Icon name="shield" size={27} strokeWidth={2} />
              </div>

              <p className="modal-kicker">Secure verification</p>
              <h2 id="identity-verification-title" className="modal-title">
                Confirm your identity
              </h2>
              <p className="modal-copy">
                Enter the applicant's date of birth to securely access the
                appointment rescheduling page.
              </p>

              <div className="modal-form">
                <div>
                  <p className="modal-label">Application reference</p>
                  <div className="reference-readonly">
                    {data?.applicationRef}
                  </div>
                </div>

                <div>
                  <label className="modal-label" htmlFor="date-of-birth">
                    Date of birth
                  </label>
                  <input
                    id="date-of-birth"
                    className="date-input"
                    type="date"
                    value={dobInput}
                    onChange={(event) => {
                      setDobInput(event.target.value);
                      setDobError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && dobInput) {
                        void handleDobSubmit();
                      }
                    }}
                    aria-describedby={dobError ? "dob-error" : undefined}
                    autoFocus
                  />
                  {dobError && (
                    <p id="dob-error" className="modal-error" role="alert">
                      {dobError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="modal-primary-button"
                  disabled={verifyingDob || !dobInput}
                  onClick={() => void handleDobSubmit()}
                >
                  {verifyingDob ? (
                    <>
                      <span className="button-spinner" />
                      Verifying
                    </>
                  ) : (
                    <>
                      Continue securely
                      <Icon name="arrow" size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowDobModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
