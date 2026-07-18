// src/lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomInt } from "crypto";


// ── Prisma singleton (avoids hot-reload connection leaks) ──────────────────
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ── Types ──────────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "Permohonan diterima"
  | "Permohonan menunggu dokumen"
  | "Permohonan disetujui"
  | "Permohonan ditunda"
  | "Permohonan ditolak"
  | "Permohonan sedang proses cetak"
  | "Paspor selesai diproses";

export type Submission = {
  id: string;
  applicationRef: string;
  status: ApplicationStatus;
  statusNote?: string | null;
  createdAt: string; // ISO string for backward compat
  appointmentSlot: string | null;
  isChildPassportRequest: boolean;
  previousPassportStatus: "still_valid" | "expired" | "none";
  reason: string;
  fullName: string;
  aliasName: string;
  gender: string;
  dateOfBirth: string;
  birthCity: string;
  birthCountry: string;
  birthCertIssuedIn: string;
  religion: string;
  nationality: string;
  passportId: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  registrationId: string;
  oldPassportNumber: string;
  oldPassportIssueDate: string;
  oldPassportExpiryDate: string;
  oldPassportIssuer: string;
  ktpNumber: string;
  ktpIssueDate: string;
  birthCertNumber: string;
  addressCanadaStreet: string;
  addressCanadaCity: string;
  addressCanadaProvince: string;
  addressCanadaPostalCode: string;
  addressIndonesiaStreet: string;
  addressIndonesiaCity: string;
  addressIndonesiaProvince: string;
  addressIndonesiaDistrict: string;
  addressIndonesiaPostalCode: string;
  phoneNumber: string;
  email: string;
  maritalStatus: string;
  occupation: string;
  workplace: string;
  workplaceAddress: string;
  stayStatus: string;
  fatherName: string;
  fatherBirthPlace: string;
  fatherBirthDate: string;
  fatherNationality: string;
  fatherAddress: string;
  motherName: string;
  motherBirthPlace: string;
  motherBirthDate: string;
  motherNationality: string;
  motherAddress: string;
  spouseName: string;
  spouseBirthPlace: string;
  spouseBirthDate: string;
  spouseNationality: string;
  spouseAddress: string;
  emergencyCanadaName: string;
  emergencyCanadaAddress: string;
  emergencyCanadaPhone: string;
  emergencyCanadaRelation: string;
  emergencyIndonesiaName: string;
  emergencyIndonesiaAddress: string;
  emergencyIndonesiaPhone: string;
  emergencyIndonesiaRelation: string;
  portalType: string;
  disclaimerAccepted: boolean;
  passportScanName?: string | null;
  oldPassportScan?: string | null;
  birthCertScan?: string | null;
  ktpScan?: string | null;
  permitScan?: string | null;
  otherIdScan?: string | null;
  formScan?: string | null;
  statementScan?: string | null;
  addressProofScan?: string | null;
  policeReportLetter?: string | null;
  damageChronologyLetter?: string | null;
  completionLetter?: string | null;
  loa?: string | null;
  jobOffer?: string | null;
  workContract?: string | null;
  fatherPassport?: string | null;
  fatherPermit?: string | null;
  motherPassport?: string | null;
  motherPermit?: string | null;
  parentsMarriageDoc?: string | null;
  otherForeignPassport?: string | null;

  // ── Visa Application Form (KJRI official form) ─
  firstName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  passportPlaceOfIssuance?: string | null;
  passportType?: string | null;
  addressCanadaCountry?: string | null;
  addressCanadaFax?: string | null;
  addressCanadaCell?: string | null;
  occupationPosition?: string | null;
  occupationCompanyAddress?: string | null;
  occupationCity?: string | null;
  occupationProvincePostal?: string | null;
  occupationCountry?: string | null;
  occupationPhone?: string | null;
  occupationFax?: string | null;
  typeOfVisaRequested?: string | null;
  visaCategory?: string | null;
  visaProductCode?: string | null;
  visaProductLabel?: string | null;
  purposeOfVisit?: string | null;
  purposeOfVisitOther?: string | null;
  addressIndonesiaPhone?: string | null;
  flightPortOfEntry?: string | null;
  flightDateOfEntry?: string | null;
  flightNoEntry?: string | null;
  flightPortOfExit?: string | null;
  flightDateOfExit?: string | null;
  flightNoExit?: string | null;
  hasInvitationLetter?: boolean | null;
  submissionMethod?: string | null;
  registrationNumber?: string | null;
  sponsorCompany?: string | null;
  sponsorCityProvincePostal?: string | null;
  sponsorFax?: string | null;
  everBeenToIndonesia?: boolean | null;
  indonesiaVisitDetails?: string | null;
  hasOtherValidVisa?: boolean | null;
  otherVisaCountry?: string | null;
  visaEverDenied?: boolean | null;
  everOrderedToLeave?: boolean | null;
  everArrestedConvicted?: boolean | null;
  signatureName?: string | null;
  signatureDate?: string | null;
  photoScan?: string | null;
  invitationLetterScan?: string | null;
};

// ── Helper: map Prisma row → Submission type ───────────────────────────────
function toSubmission(row: any): Submission {
  return {
    ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    appointmentSlot: row.appointmentSlot instanceof Date
      ? row.appointmentSlot.toISOString()
      : row.appointmentSlot ?? null,
    portalType: row.portalType ?? "visa",
    status: row.status as ApplicationStatus,
    previousPassportStatus: row.previousPassportStatus as Submission["previousPassportStatus"],
  };
}

// ── Ref generator ──────────────────────────────────────────────────────────
export function generateApplicationRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(0, alphabet.length)];
  return `APP-${date}-${code}`;
}

// ── CRUD Functions (drop-in replacements) ──────────────────────────────────

export async function createSubmission(
  data: Omit<Submission, "id" | "applicationRef" | "createdAt" | "appointmentSlot" | "status" | "statusNote">,
  applicationRef?: string
): Promise<Submission> {
  const row = await prisma.submission.create({
    data: {
      ...data,
      applicationRef: applicationRef ?? generateApplicationRef(),
      status: "Permohonan diterima",
    },
  });
  return toSubmission(row);
}

export async function getSubmissionByRef(ref: string): Promise<Submission | undefined> {
  const row = await prisma.submission.findFirst({
    where: { applicationRef: { equals: ref, mode: "insensitive" } },
  });
  return row ? toSubmission(row) : undefined;
}

export async function listSubmissions(): Promise<Submission[]> {
  const rows = await prisma.submission.findMany({
    orderBy: { appointmentSlot: { sort: "asc", nulls: "last" } },
  });
  return rows.map(toSubmission);
}

// ── Vancouver day → UTC range ─────────────────────────────────────────────
// Vancouver is permanently UTC-8 (PST) — no daylight saving.
// A slot stored as e.g. 2026-03-10T16:30:00-08:00 is saved in DB as
// 2026-03-11T00:30:00.000Z.  Filtering with T00:00:00Z–T23:59:59Z misses it.
// We must shift the window by +8 hours so the full Vancouver calendar day is covered.
const VANCOUVER_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC-8, permanent PST

function ymdToVancouverDayRange(ymd: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  // Vancouver midnight = UTC 08:00 that day
  const start = new Date(Date.UTC(y, m - 1, d) + VANCOUVER_OFFSET_MS);
  // Vancouver 23:59:59.999 = one ms before next Vancouver midnight
  const end   = new Date(Date.UTC(y, m - 1, d + 1) + VANCOUVER_OFFSET_MS - 1);
  return { start, end };
}

export async function listSubmissionsBySlotDateRange(
  fromYmd: string,
  toYmd: string
): Promise<Submission[]> {
  const fromRange = ymdToVancouverDayRange(fromYmd);
  const toRange   = ymdToVancouverDayRange(toYmd);

  // Reject invalid / missing date strings instead of passing Invalid Date to Prisma
  if (!fromRange || !toRange) {
    console.error("[listSubmissionsBySlotDateRange] invalid date args:", { fromYmd, toYmd });
    return [];
  }

  const rows = await prisma.submission.findMany({
    where: {
      appointmentSlot: {
        gte: fromRange.start,   // start of fromYmd in Vancouver (=08:00 UTC)
        lte: toRange.end,       // end   of toYmd   in Vancouver (=07:59:59.999 UTC next day)
      },
    },
    orderBy: { appointmentSlot: "asc" },
  });
  return rows.map(toSubmission);
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  const row = await prisma.submission.findUnique({ where: { id } });
  return row ? toSubmission(row) : undefined;
}
// ── Slot date helper ───────────────────────────────────────────────────────
function slotToDate(iso: string): Date {
  return new Date(iso.includes("Z") ? iso : iso + "Z");
}

export async function bookSlot(id: string, slotIso: string, capacity = 3): Promise<Submission | null> {
  const slotDate = slotToDate(slotIso);

  const count = await prisma.submission.count({
    where: { appointmentSlot: slotDate, NOT: { id } },
  });

  if (count >= capacity) return null;

  const row = await prisma.submission.update({
    where: { id },
    data: { appointmentSlot: slotDate },
  });

  return toSubmission(row);
}
export async function rescheduleSlotByRegistrationId(
  registrationId: string,
  newSlotIso: string,
  capacity = 3,  // ← add param
): Promise<{ ok: true; submission: Submission } | { ok: false; error: string }> {
  const sub = await prisma.submission.findFirst({ where: { registrationId } });
  if (!sub) return { ok: false, error: "Submission not found" };
  if (!sub.appointmentSlot) return { ok: false, error: "Tidak ada Jadwal Janji Temu" };

  if (isPast0001VancouverToday() && isSameDayOrPastInVancouver(sub.appointmentSlot.toISOString())) {
    return { ok: false, error: "Jadwal tidak dapat diubah pada hari yang sama." };
  }

  if (sub.appointmentSlot.toISOString() === newSlotIso) {
    return { ok: true, submission: toSubmission(sub) };
  }

  if (isPast0001VancouverToday() && isSameDayOrPastInVancouver(newSlotIso)) {
    return { ok: false, error: "Tidak bisa memilih jadwal pada hari yang sama." };
  }

  const count = await prisma.submission.count({
    where: { appointmentSlot: slotToDate(newSlotIso), NOT: { id: sub.id } },
  });
  if (count >= capacity) return { ok: false, error: "Slot sudah penuh" };

  const updated = await prisma.submission.update({
    where: { id: sub.id },
    data: { appointmentSlot: slotToDate(newSlotIso) },
  });
  return { ok: true, submission: toSubmission(updated) };
}
export async function updateSubmissionStatus(
  id: string,
  status: ApplicationStatus,
  statusNote?: string
): Promise<Submission | null> {
  const row = await prisma.submission.update({
    where: { id },
    data: { status, statusNote: statusNote ?? "" },
  });
  return toSubmission(row);
}

export async function deleteSubmission(id: string): Promise<boolean> {
  await prisma.submission.delete({ where: { id } });
  return true;
}

export async function getSubmissionByRegistrationId(registrationId: string) {
  const row = await prisma.submission.findFirst({ where: { registrationId } });
  return row ? toSubmission(row) : undefined;
}

export async function getSubmissionByRegistrationIdAndDob(
  registrationId: string,
  dob: string
) {
  const row = await prisma.submission.findFirst({
    where: {
      registrationId: registrationId.trim(),
      dateOfBirth: dob.trim(),
    },
  });
  return row ? toSubmission(row) : undefined;
}

// ── Vancouver timezone helpers (unchanged) ─────────────────────────────────
function vancouverParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    y: Number(get("year")), m: Number(get("month")), d: Number(get("day")),
    hh: Number(get("hour")), mm: Number(get("minute")),
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function isSameDayOrPastInVancouver(slotIso: string | null) {
  if (!slotIso) return false;
  return vancouverParts(new Date(slotIso)).ymd <= vancouverParts(new Date()).ymd;
}

function isPast0001VancouverToday() {
  const now = vancouverParts(new Date());
  return now.hh > 0 || (now.hh === 0 && now.mm >= 1);
}