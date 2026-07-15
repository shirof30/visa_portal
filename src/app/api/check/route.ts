import { NextRequest, NextResponse } from "next/server";
import { getSubmissionByRef } from "@/lib/db";

// In-memory rate limiter: max 10 attempts per IP per 15 minutes
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

const REF_REGEX = /^APP-\d{8}-[A-Z0-9]{6}$/;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim().toUpperCase() ?? "";

  if (!ref || !REF_REGEX.test(ref)) {
    return NextResponse.json(
      { error: "Format nomor referensi tidak valid." },
      { status: 400 }
    );
  }

  const sub = await getSubmissionByRef(ref);

  if (!sub) {
    return NextResponse.json(
      { error: "Permohonan tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    applicationRef: sub.applicationRef,
    fullName: sub.fullName,
    reason: sub.reason,
    status: sub.status,
    statusNote: sub.statusNote,
    appointmentSlot: sub.appointmentSlot,
    createdAt: sub.createdAt,
    registrationId: sub.registrationId,
  });
}