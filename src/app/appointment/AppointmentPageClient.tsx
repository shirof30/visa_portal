"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
type Submission = {
  id: string;
  fullName: string;
  registrationId?: string;
  appointmentSlot: string | null;
};

type SpecialHours = { date: string; hours: string };

type WeekendHours = {
  saturday: string;
  sunday: string;
};

type SiteConfig = {
  enableSameDayService: boolean;
  holidays: string[];
  specialHours: SpecialHours[];
  weekdaySlotInterval: number;
  weekendSlotInterval: number;
  weekendHours: WeekendHours;
};

type Window = { startMin: number; endMin: number };

// ── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_STEP_MIN = 30;
const WEEKDAY_SLOT_CAPACITY = 2;
const WEEKEND_SLOT_CAPACITY = 2;

function getSlotCapacity(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return 2; // Visa: max 2 per slot
}
const SAME_DAY_LAST_MIN = 11 * 60 + 30;
const SAME_DAY_BUFFER_MIN = 15;

const WINDOWS_MON_THU: Window[] = [
  { startMin: 9 * 60 + 30, endMin: 11 * 60 + 30 },
  { startMin: 13 * 60, endMin: 16 * 60 + 30 },
];
const WINDOWS_FRI: Window[] = [
  { startMin: 9 * 60 + 30, endMin: 11 * 60 + 30 },
  { startMin: 14 * 60 + 30, endMin: 17 * 60 },
];

// ── Utilities ────────────────────────────────────────────────────────────────
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function pad2(n: number) { return String(n).padStart(2, "0"); }
function minutesToTime(m: number) { return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}:00`; }
function slotTimeMins(slotIso: string) {
  const [h, m] = slotIso.split("T")[1].slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function vancouverDateStr(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function vancouverNowMinutes() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return Number(get("hour")) * 60 + Number(get("minute"));
}

function toDateOnlyLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toDateOnlyUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function parseDateStrToUtcNoon(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function addBusinessDaysFromDateStr(startDateStr: string, days: number, holidaySet: Set<string>): string {
  const cursor = parseDateStrToUtcNoon(startDateStr);
  let added = 0;
  while (added < days) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const dow = cursor.getUTCDay();
    const ds = toDateOnlyUTC(cursor);
    if (dow !== 0 && dow !== 6 && !holidaySet.has(ds)) added++;
  }
  return toDateOnlyUTC(cursor);
}

function nextBusinessDayFromDateStr(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const cursor = new Date(y, m - 1, d);
  while (true) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) return toDateOnlyLocal(cursor);
  }
}

function addMonths(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + delta);
  return d;
}

function buildMonthMatrix(monthDate: Date): (Date | null)[][] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  // Start week on Monday: shift Sunday (0) to 6, Mon=0, Tue=1, ...
  const rawDay = new Date(year, month, 1).getDay();
  const startWeekDay = (rawDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ── Slot / window helpers ────────────────────────────────────────────────────
function parseSpecialHours(hours: string): Window[] | "CLOSED" {
  if (hours === "CLOSED") return "CLOSED";
  const match = hours.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return "CLOSED";
  const [, startH, startM, endH, endM] = match.map(Number);
  return [{ startMin: startH * 60 + startM, endMin: endH * 60 + endM }];
}

function windowsForDate(
  dateStr: string,
  specialHoursMap: Map<string, string>,
  weekendHours?: WeekendHours
): Window[] | "CLOSED" {
  const special = specialHoursMap.get(dateStr);
  if (special) return parseSpecialHours(special);
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  if (day === 6) return parseSpecialHours(weekendHours?.saturday ?? "CLOSED");
  if (day === 0) return parseSpecialHours(weekendHours?.sunday ?? "CLOSED");
  if (day === 5) return WINDOWS_FRI;
  return WINDOWS_MON_THU;
}

function generateSlotsForDate(
  dateStr: string,
  isSameDay: boolean,
  specialHoursMap: Map<string, string>,
  weekendHours?: WeekendHours,
  stepMin = DEFAULT_STEP_MIN
) {
  if (isSameDay) {
    const slots: string[] = [];
    for (let mins = 9 * 60; mins <= 11 * 60 + 30; mins += stepMin)
      slots.push(`${dateStr}T${minutesToTime(mins)}`);
    return slots;
  }
  const windows = windowsForDate(dateStr, specialHoursMap, weekendHours);
  if (windows === "CLOSED") return [];
  const slots: string[] = [];
  for (const w of windows)
    for (let mins = w.startMin; mins <= w.endMin; mins += stepMin)
      slots.push(`${dateStr}T${minutesToTime(mins)}`);
  return slots;
}

function maxSlotsForDate(
  dateStr: string,
  specialHoursMap: Map<string, string>,
  weekendHours?: WeekendHours,
  stepMin = DEFAULT_STEP_MIN
): number {
  const windows = windowsForDate(dateStr, specialHoursMap, weekendHours);
  if (windows === "CLOSED") return 0;
  return (windows as Window[]).reduce((acc, w) => acc + Math.floor((w.endMin - w.startMin) / stepMin) + 1, 0);
}

function splitSlotsByBreak(
  dateStr: string,
  slots: string[],
  specialHoursMap: Map<string, string>,
  weekendHours?: WeekendHours
) {
  const windows = windowsForDate(dateStr, specialHoursMap, weekendHours);
  if (windows === "CLOSED") return { morning: [], afternoon: [] };
  const breakAfter = (windows as Window[])[0]?.endMin ?? 12 * 60;
  const morning: string[] = [], afternoon: string[] = [];
  for (const s of slots) {
    if (slotTimeMins(s) <= breakAfter) morning.push(s);
    else afternoon.push(s);
  }
  return { morning, afternoon };
}
function isSameDayCalendarClosedForDate(dateStr: string) {
  return dateStr === vancouverDateStr(new Date()) && vancouverNowMinutes() >= SAME_DAY_LAST_MIN;
}

function isSameDaySlotClosed(slotIso: string, selectedDate: string) {
  if (selectedDate !== vancouverDateStr(new Date())) return false;
  const nowMins = vancouverNowMinutes();
  if (nowMins >= SAME_DAY_LAST_MIN) return true;
  return slotTimeMins(slotIso) - nowMins <= SAME_DAY_BUFFER_MIN;
}

// ── SlotButton ───────────────────────────────────────────────────────────────
function SlotButton({
  slot, selectedDate, selectedSlot, isSameDayService,
  isSlotTaken, isCurrentBooking, onSelect,
}: {
  slot: string;
  selectedDate: string;
  selectedSlot: string | null;
  isSameDayService: boolean;
  isSlotTaken: (s: string) => boolean;
  isCurrentBooking: boolean;
  onSelect: (s: string) => void;
}) {
  const hour = slot.split("T")[1].slice(0, 5);
  const taken = isSlotTaken(slot);
  const closedBySameDay = isSameDayService && isSameDaySlotClosed(slot, selectedDate);
  const disabled = taken || closedBySameDay || isCurrentBooking;
  const selected = selectedSlot === slot;

  let label: string;
  if (isCurrentBooking) label = "Your Slot";
  else if (taken) label = "Full";
  else if (closedBySameDay) label = "Tutup";
  else if (selected) label = "✓ Selected";
  else label = "Available";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(slot)}
      className={cx(
        "flex flex-col items-center justify-center rounded-xl border py-3 text-sm transition-all duration-150 select-none",
        isCurrentBooking && "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600",
        !isCurrentBooking && disabled && "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300",
        selected && !disabled && "cursor-pointer border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20 scale-[1.02]",
        !selected && !disabled && "cursor-pointer border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:shadow-sm active:scale-[0.98]",
      )}
    >
      <span className="font-bold text-base leading-none">{hour}</span>
      <span className={cx(
        "text-[10px] mt-1 font-medium",
        isCurrentBooking ? "text-amber-500" :
          selected && !disabled ? "text-red-100" :
            disabled ? "text-gray-300" : "text-gray-400",
      )}>
        {label}
      </span>
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AppointmentPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const submissionId = searchParams.get("id") ?? "";
  const registrationId = searchParams.get("registrationId") ?? "";
  const applicationRef = searchParams.get("ref") ?? "";
  const service = searchParams.get("service") ?? "";

  const isSameDayService = service === "Layanan Paspor Satu Hari Jadi";
  const isReschedule = !!registrationId && !submissionId;
  const isRefFlow = !!applicationRef && !submissionId && !registrationId;

  const dob = typeof window !== "undefined" && registrationId
    ? sessionStorage.getItem(`resched_dob_${registrationId}`) : null;

  // DOB gate state (for ?ref= flow)
  const [dobInput, setDobInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);

  // Resolved id: from URL (existing flows) or from DOB verification
  const resolvedId = isRefFlow ? (verifiedId ?? "") : submissionId;

  async function handleVerifyDob() {
    setVerifyError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/submissions/verify-ref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationRef, dateOfBirth: dobInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVerifyError((data as any).error ?? "Verifikasi gagal.");
      } else {
        setVerifiedId((data as any).id);
        setSubmissionName((data as any).fullName ?? "");
      }
    } finally {
      setVerifying(false);
    }
  }

  const todayVanStr = vancouverDateStr(new Date());

  // Frozen ref: the slot the user already has booked. Never changes after first load.
  const initialBookedSlot = useRef<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (!isSameDayService) return todayVanStr;
    if (vancouverNowMinutes() >= SAME_DAY_LAST_MIN) return nextBusinessDayFromDateStr(todayVanStr);
    return todayVanStr;
  });

  const [monthViewDate, setMonthViewDate] = useState<Date>(() => {
    const start = isSameDayService && vancouverNowMinutes() >= SAME_DAY_LAST_MIN
      ? nextBusinessDayFromDateStr(todayVanStr) : todayVanStr;
    const [y, m] = start.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const [existing, setExisting] = useState<Submission[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const getStepMin = useCallback((dateStr: string): number => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    if (isWeekend) return siteConfig?.weekendSlotInterval ?? 15;
    return siteConfig?.weekdaySlotInterval ?? DEFAULT_STEP_MIN;
  }, [siteConfig]);
  const [configLoading, setConfigLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionName, setSubmissionName] = useState<string>("");

  const missingId = !submissionId && !registrationId && !applicationRef;

  // Fetch config
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/config", { cache: "no-store" });
      if (!alive || !res.ok) { setConfigLoading(false); return; }
      setSiteConfig(await res.json() as SiteConfig);
      setConfigLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const holidaySet = useMemo(() => new Set((siteConfig?.holidays ?? []).filter(Boolean)), [siteConfig]);
  const isHoliday = useCallback((d: string) => holidaySet.has(d), [holidaySet]);

  const specialHoursMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const sh of siteConfig?.specialHours ?? []) map.set(sh.date, sh.hours);
    return map;
  }, [siteConfig]);

  // Fetch submissions for visible month + load existing booking
  useEffect(() => {
    let alive = true;
    (async () => {
      // Guard: don't fetch if monthViewDate is somehow invalid
      if (isNaN(monthViewDate.getTime())) return;
      const from = toDateOnlyLocal(new Date(monthViewDate.getFullYear(), monthViewDate.getMonth(), 1));
      const to = toDateOnlyLocal(new Date(monthViewDate.getFullYear(), monthViewDate.getMonth() + 1, 0));
      // Extra guard: both must be valid YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return;
      const res = await fetch(`/api/submissions/public?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" });
      if (!res.ok || !alive) return;

      const json = await res.json().catch(() => null);
      const data: Submission[] = Array.isArray(json) ? json
        : Array.isArray((json as any)?.items) ? (json as any).items : [];
      if (alive) setExisting(data);

      // New submission: pre-load the name and mark their current slot
      if (resolvedId) {
        const found = data.find((s) => s.id === resolvedId);
        if (found) {
          setSubmissionName(found.fullName);
          if (found.appointmentSlot && !initialBookedSlot.current) {
            initialBookedSlot.current = found.appointmentSlot;
            setSelectedDate(vancouverDateStr(new Date(found.appointmentSlot)));
            setSelectedSlot(null); // force user to explicitly pick
          }
        }
      }

      // Reschedule: fetch by registrationId
      if (registrationId && alive) {
        if (!dob) return; 
        const r = await fetch(
          `/api/submissions/by-registration`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId, dateOfBirth: dob }),
            cache: "no-store",
          }
        );
        if (!r.ok || !alive) return;
        const sub = await r.json() as Submission;
        setSubmissionName(sub.fullName);
        if (sub.appointmentSlot && !initialBookedSlot.current) {
          initialBookedSlot.current = sub.appointmentSlot;
          const bookedDate = vancouverDateStr(new Date(sub.appointmentSlot));
          const [y, m] = bookedDate.split("-").map(Number);
          setSelectedDate(bookedDate);
          setMonthViewDate(new Date(y, m - 1, 1));
          setSelectedSlot(null);
        }
      }
    })();
    return () => { alive = false; };
  }, [resolvedId, registrationId, monthViewDate]);

  const minBookingDateStr = useMemo(() => {
    if (isSameDayService) return todayVanStr;
    return addBusinessDaysFromDateStr(todayVanStr, 3, holidaySet);
  }, [isSameDayService, todayVanStr, holidaySet]);


  useEffect(() => {
    // Don't override the booked date that was loaded from the existing appointment
    if (initialBookedSlot.current) return;

    let targetDate = minBookingDateStr;

    // For same-day: if today is past cutoff, jump to next business day
    if (isSameDayService && isSameDayCalendarClosedForDate(targetDate)) {
      targetDate = nextBusinessDayFromDateStr(targetDate);
    }

    const [y, m] = targetDate.split("-").map(Number);
    setMonthViewDate(new Date(y, m - 1, 1));
    setSelectedDate(targetDate);
    setSelectedSlot(null);
  }, [minBookingDateStr, isSameDayService]);

  // ── Slot availability ─────────────────────────────────────────────────────
  // Rules:
  //  - Regular services → a slot is blocked once any submission holds it
  //  - Same-day ignores regular bookings (they see all slots open)
  // Normalize slot strings to "YYYY-MM-DDTHH:MM" for comparison
  // because DB may store "T13:30:00" while generated slots are "T13:30:00" —
  // but just to be safe, always compare only the first 16 chars
  const normalizeSlot = (s: string) => s.slice(0, 16);

  const isSlotTaken = useCallback((slot: string): boolean => {
    const norm = normalizeSlot(slot);
    const count = existing.reduce((acc, s) => {
      if (!s.appointmentSlot) return acc;
      return normalizeSlot(s.appointmentSlot) === norm ? acc + 1 : acc;
    }, 0);

    return count >= getSlotCapacity(slot.split("T")[0]);
  }, [existing]);

  const bookingCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of existing) {
      if (!s.appointmentSlot) continue;
      // appointmentSlot is UTC — convert to Vancouver date for correct day grouping
      const d = vancouverDateStr(new Date(s.appointmentSlot));
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    return map;
  }, [existing]);

  const isDateFullyBooked = useCallback((dateStr: string) => {
    const capacityForDay = maxSlotsForDate(dateStr, specialHoursMap, siteConfig?.weekendHours, getStepMin(dateStr)) * getSlotCapacity(dateStr);
    return (bookingCountByDate.get(dateStr) ?? 0) >= capacityForDay;
  }, [bookingCountByDate, specialHoursMap, siteConfig?.weekendHours, getStepMin]);

  const slotsForSelectedDate = useMemo(
    () => generateSlotsForDate(selectedDate, isSameDayService, specialHoursMap, siteConfig?.weekendHours, getStepMin(selectedDate)),
    [selectedDate, isSameDayService, specialHoursMap, siteConfig?.weekendHours, getStepMin]);

  const { morning: morningSlots, afternoon: afternoonSlots } = useMemo(
    () => splitSlotsByBreak(selectedDate, slotsForSelectedDate, specialHoursMap, siteConfig?.weekendHours),
    [selectedDate, slotsForSelectedDate, specialHoursMap, siteConfig?.weekendHours]);

  // ── Book ──────────────────────────────────────────────────────────────────
  const handleBook = useCallback(async () => {
    setError(null);
    if (!selectedSlot) { setError("Please select a time slot first."); return; }
    if (isReschedule && !dob) { setError("Tanggal lahir belum dikonfirmasi. Silakan kembali ke halaman Cek Status."); return; }
    if (!isSameDayService && selectedDate < minBookingDateStr) { setError("Appointment must be booked at least 3 business days in advance."); return; }

    setLoading(true);
    const res = await fetch(isReschedule ? "/api/submissions/reschedule" : "/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isReschedule
        ? { registrationId, slotIso: selectedSlot, dateOfBirth: dob }
        : { id: resolvedId, slotIso: selectedSlot }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as any).error ?? "Gagal memesan slot ini.");
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => null);
    if (isReschedule) {
      sessionStorage.removeItem(`resched_dob_${registrationId}`);
      const ref = (data as any)?.applicationRef;
      router.push(ref
        ? `/submit/complete?ref=${encodeURIComponent(ref)}`
        : `/submit/complete?registrationId=${encodeURIComponent(registrationId)}`);
    } else {
      const ref = (data as any)?.applicationRef;
      router.push(ref
        ? `/submit/complete?ref=${encodeURIComponent(ref)}`
        : `/submit/complete?id=${encodeURIComponent(resolvedId)}`);
    }
  }, [selectedSlot, isReschedule, dob, isSameDayService, selectedDate, minBookingDateStr, registrationId, resolvedId, router]);

  const monthMatrix = useMemo(() => buildMonthMatrix(monthViewDate), [monthViewDate]);
  const monthLabel = monthViewDate.toLocaleString("en-CA", { month: "long", year: "numeric" });
  const canConfirm = !loading && !!selectedSlot && (isSameDayService || selectedDate >= minBookingDateStr);

  if (missingId) return (
    <div className=" pt-24 flex items-center justify-center">
      <p className="text-sm text-gray-500">ID tidak ditemukan. Silakan mulai ulang.</p>
    </div>
  );

  // ── DOB gate for ?ref= booking links ─────────────────────────────────────
  if (isRefFlow && !verifiedId) return (
    <div className="pt-24 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">KJRI Vancouver</p>
            <h1 className="text-xl font-extrabold text-gray-900">Verifikasi Identitas</h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter your date of birth to access the appointment booking page.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Nomor Referensi
              </label>
              <p className="text-sm font-mono font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {applicationRef}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => { setDobInput(e.target.value); setVerifyError(null); }}
                onKeyDown={(e) => e.key === "Enter" && dobInput && handleVerifyDob()}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
              />
            </div>

            {verifyError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-xs text-red-700">{verifyError}</p>
              </div>
            )}

            <button
              onClick={handleVerifyDob}
              disabled={!dobInput || verifying}
              className="w-full rounded-full bg-red-500 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/25 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Memverifikasi…
                </span>
              ) : "Lanjutkan →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className=" pt-20 pb-16">
      <div className="mx-auto max-w-5xl px-4">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 mb-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                {isSameDayService ? "Same-Day Service" : isReschedule ? "Reschedule" : "Book Appointment"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {isReschedule ? "Reschedule Appointment" : "Select Appointment Time"}
            </h1>
            {submissionName && (
              <p className="text-sm text-gray-500 mt-1">
                untuk <span className="font-semibold text-gray-700">{submissionName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.history.length > 1 ? router.back() : router.push(isReschedule ? "/check" : "/apply")}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* Reschedule: show current booking */}
        {isReschedule && initialBookedSlot.current && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-amber-800">
              Your current appointment:{" "}
              <span className="font-bold">
                {new Date(initialBookedSlot.current.split("T")[0] + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" })}
                {" · "}
                {initialBookedSlot.current.split("T")[1].slice(0, 5)}
              </span>
              {" "}— pilih slot baru di bawah.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isSameDayService && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 px-5 py-4">
            <p className="text-sm font-bold text-amber-900">⚡ Layanan Paspor Satu Hari Jadi</p>
            <p className="text-xs text-amber-700 mt-1">Slots available 09:00–11:30. Please arrive on time.</p>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Calendar */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4 bg-white/80">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Calendar</p>
              <p className="text-sm font-semibold text-gray-800">Select appointment date</p>
              {!isSameDayService && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Min. <span className="font-semibold text-gray-600">3 business days</span> before appointment
                </p>
              )}
            </div>

            <div className="px-5 py-5">
              {configLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => setMonthViewDate(addMonths(monthViewDate, -1))}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer">
                      ←
                    </button>
                    <span className="text-sm font-bold text-gray-800">{monthLabel}</span>
                    <button type="button" onClick={() => setMonthViewDate(addMonths(monthViewDate, 1))}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer">
                      →
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-gray-400">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {monthMatrix.map((week, wi) =>
                      week.map((dateObj, di) => {
                        if (!dateObj) return <div key={`${wi}-${di}`} />;
                        const dateStr = toDateOnlyLocal(dateObj);
                        const isBeforeMin = dateStr < minBookingDateStr;
                        const fullyBooked = isDateFullyBooked(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const isBookedDate = !!initialBookedSlot.current && initialBookedSlot.current.split("T")[0] === dateStr;
                        const holiday = isHoliday(dateStr);
                        const sameDayClosed = isSameDayService && isSameDayCalendarClosedForDate(dateStr);
                        const speciallyClosed = specialHoursMap.get(dateStr) === "CLOSED";
                        const dow = dateObj.getDay();
                        const hasSpecialOverride = specialHoursMap.has(dateStr) && specialHoursMap.get(dateStr) !== "CLOSED";
                        const isWeekendClosed =
                          !hasSpecialOverride && (
                            (dow === 6 && (siteConfig?.weekendHours?.saturday ?? "CLOSED") === "CLOSED") ||
                            (dow === 0 && (siteConfig?.weekendHours?.sunday ?? "CLOSED") === "CLOSED")
                          );
                        const disabled = isBeforeMin || fullyBooked || isWeekendClosed || holiday || sameDayClosed || speciallyClosed;
                        const isToday = dateStr === todayVanStr;

                        return (
                          <button
                            key={`${wi}-${di}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                            className={cx(
                              "relative flex flex-col items-center justify-center h-12 w-full rounded-xl text-sm font-semibold transition-all duration-150 select-none border",
                              disabled && "cursor-not-allowed text-gray-300 bg-transparent border-transparent",
                              isBookedDate && !isSelected && !disabled && "cursor-pointer bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:scale-[1.05]",
                              isSelected && !disabled && "cursor-pointer bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.08] z-10",
                              !isSelected && !isBookedDate && !disabled && isToday && "cursor-pointer bg-white border-red-400 text-red-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-[1.05]",
                              !isSelected && !isBookedDate && !disabled && !isToday && "cursor-pointer bg-white border-gray-200 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-[1.05]",
                            )}
                          >
                            <span className="font-semibold leading-none">{dateObj.getDate()}</span>
                            {(holiday || speciallyClosed) && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400" />
                            )}
                            {fullyBooked && !holiday && !speciallyClosed && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gray-300" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" />Selected</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Holiday</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-300" />Full</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-200 border border-amber-300" />Your Slot</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Time slots + confirm */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden flex-1">
              <div className="border-b border-gray-100 px-5 py-4 bg-white/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {selectedSlot && (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600">{selectedSlot.split("T")[1].slice(0, 5)}</span>
                  </div>
                )}
              </div>

              <div className="px-5 py-5 space-y-6">
                {morningSlots.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">🌅 Morning</p>
                      <p className="text-[10px] text-gray-400">{isSameDayService ? "09:00 – 11:30" : "09:30 – 11:30"}</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {morningSlots.map((slot) => (
                        <SlotButton
                          key={slot}
                          slot={slot}
                          selectedDate={selectedDate}
                          selectedSlot={selectedSlot}
                          isSameDayService={isSameDayService}
                          isSlotTaken={isSlotTaken}
                          isCurrentBooking={!!initialBookedSlot.current && slot.slice(0, 16) === initialBookedSlot.current.slice(0, 16)}
                          onSelect={setSelectedSlot}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && !isSameDayService && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">🌤 Afternoon</p>
                      <p className="text-[10px] text-gray-400">
                        {(() => {
                          const w = windowsForDate(selectedDate, specialHoursMap, siteConfig?.weekendHours);
                          if (w === "CLOSED" || !(w as Window[])[1]) return "";
                          const win = (w as Window[])[1];
                          return `${pad2(Math.floor(win.startMin / 60))}:${pad2(win.startMin % 60)} – ${pad2(Math.floor(win.endMin / 60))}:${pad2(win.endMin % 60)}`;
                        })()}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {afternoonSlots.map((slot) => (
                        <SlotButton
                          key={slot}
                          slot={slot}
                          selectedDate={selectedDate}
                          selectedSlot={selectedSlot}
                          isSameDayService={isSameDayService}
                          isSlotTaken={isSlotTaken}
                          isCurrentBooking={!!initialBookedSlot.current && slot.slice(0, 16) === initialBookedSlot.current.slice(0, 16)}
                          onSelect={setSelectedSlot}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {morningSlots.length === 0 && afternoonSlots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm font-semibold text-gray-700">Tidak ada slot tersedia</p>
                    <p className="text-xs text-gray-400 mt-1">Select another date on the calendar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm bar */}
            <div className="rounded-2xl border border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-xl shadow-black/5 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Confirm Appointment</p>
                  {selectedSlot ? (
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}
                      <span className="text-emerald-600">{selectedSlot.split("T")[1].slice(0, 5)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No time selected yet</p>
                  )}
                </div>
                <button
                  onClick={handleBook}
                  disabled={!canConfirm}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-sm font-bold transition-all duration-200",
                    canConfirm
                      ? "bg-red-500 text-white shadow-md shadow-red-500/25 hover:bg-red-600 hover:-translate-y-0.5 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Memproses…
                    </>
                  ) : selectedDate < minBookingDateStr ? "Select another date" : "Confirm Appointment →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
