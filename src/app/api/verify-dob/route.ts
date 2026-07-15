import { NextRequest, NextResponse } from "next/server";
import { getSubmissionByRegistrationIdAndDob } from "@/lib/db";

// ── In-memory rate limiter ──────────────────────────────────────────────────
// Keyed by registrationId. Resets on server restart, which is fine —
// persistent brute-force across restarts is extremely unlikely given the
// 15-minute window and limited date space (~365 values/year).

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

type AttemptRecord = { count: number; lockedUntil: number | null };
const attempts = new Map<string, AttemptRecord>();

function getRecord(id: string): AttemptRecord {
  if (!attempts.has(id)) attempts.set(id, { count: 0, lockedUntil: null });
  return attempts.get(id)!;
}

function isLocked(record: AttemptRecord): boolean {
  if (record.lockedUntil === null) return false;
  if (Date.now() < record.lockedUntil) return true;
  // Lockout expired — reset
  record.count = 0;
  record.lockedUntil = null;
  return false;
}

function recordFailure(record: AttemptRecord): void {
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
}

function recordSuccess(id: string): void {
  attempts.delete(id);
}

function minutesRemaining(record: AttemptRecord): number {
  if (!record.lockedUntil) return 0;
  return Math.ceil((record.lockedUntil - Date.now()) / 60000);
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.registrationId || !body?.dateOfBirth) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const id: string = body.registrationId;
  const record = getRecord(id);

  // Check lockout
  if (isLocked(record)) {
    const mins = minutesRemaining(record);
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${mins} menit.` },
      { status: 429 }
    );
  }

  // Verify
  const existing = await getSubmissionByRegistrationIdAndDob(id, body.dateOfBirth);

  if (!existing) {
    recordFailure(record);
    const attemptsLeft = MAX_ATTEMPTS - record.count;

    if (record.lockedUntil) {
      // Just got locked
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Akses dikunci selama 15 menit.` },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Verifikasi Tanggal Lahir Gagal. ${attemptsLeft} percobaan tersisa.` },
      { status: 403 }
    );
  }

  // Success — clear the record
  recordSuccess(id);
  return NextResponse.json({ ok: true });
}
