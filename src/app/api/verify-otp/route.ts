// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otpStore";

const verifyLog = new Map<string, number[]>();
const VERIFY_WINDOW_MS = 60 * 1000; // 1 minute
const VERIFY_MAX = 10;

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (verifyLog.get(ip) ?? []).filter((t) => now - t < VERIFY_WINDOW_MS);
  if (times.length >= VERIFY_MAX) return true;
  times.push(now);
  verifyLog.set(ip, times);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (isIpRateLimited(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat." },
        { status: 429 }
      );
    }

    const { phone, email, code } = await req.json();
    const digits = String(phone ?? "").replace(/\D/g, "");
    const emailAddr = String(email ?? "").trim();
    const submitted = String(code ?? "").trim();

    if (digits.length !== 10 || !emailAddr || !submitted) {
      return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
    }

    // FIX 3: verifyOtp now takes email to match the exact phone+email pair
    const result = verifyOtp(digits, emailAddr, submitted);

    if (result === "ok") return NextResponse.json({ ok: true });

    const messages: Record<string, string> = {
      expired: "Kode OTP sudah kedaluwarsa. Mohon minta kode baru.",
      invalid: "Kode OTP salah. Silakan coba lagi.",
      too_many_attempts: "Terlalu banyak percobaan salah. Mohon minta kode baru.",
    };

    return NextResponse.json(
      { error: messages[result] ?? "Verifikasi gagal." },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[verify-otp]", e);
    return NextResponse.json({ error: "Terjadi kesalahan. Silakan coba lagi." }, { status: 500 });
  }
}