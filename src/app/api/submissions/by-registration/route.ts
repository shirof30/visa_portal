import { NextRequest, NextResponse } from "next/server";
import { getSubmissionByRegistrationIdAndDob } from "@/lib/db";

// Rate limit: max 10 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.registrationId || !body?.dateOfBirth) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  const sub = await getSubmissionByRegistrationIdAndDob(body.registrationId, body.dateOfBirth);

  // Always return the same error whether LD doesn't exist or DOB is wrong — don't reveal which
  if (!sub) {
    return NextResponse.json(
      { error: "Verifikasi Tanggal Lahir Gagal. Silahkan coba kembali." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    fullName: sub.fullName,
    registrationId: sub.registrationId,
    appointmentSlot: sub.appointmentSlot,
  });
}