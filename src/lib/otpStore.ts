// src/lib/otpStore.ts
// In-memory OTP store. Survives hot-reloads in dev via global singleton.
// Each entry expires after OTP_TTL_MS and is deleted on first successful verify.

import { randomInt, timingSafeEqual } from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const g = globalThis as unknown as {
  __otpStore?: Map<string, OtpEntry>;
  __otpCleanupStarted?: boolean;
};
if (!g.__otpStore) g.__otpStore = new Map();
const store = g.__otpStore;


if (!g.__otpCleanupStarted) {
  g.__otpCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.expiresAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}


function storeKey(phone: string, email: string): string {
  return `${phone}::${email.toLowerCase().trim()}`;
}


export function createOtp(phone: string, email: string): string {
  const code = String(randomInt(100000, 999999));
  store.set(storeKey(phone, email), { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
  return code;
}

export type VerifyResult = "ok" | "expired" | "invalid" | "too_many_attempts";

export function verifyOtp(phone: string, email: string, submitted: string): VerifyResult {
  const key = storeKey(phone, email);
  const entry = store.get(key);
  if (!entry) return "expired";
  if (Date.now() > entry.expiresAt) { store.delete(key); return "expired"; }
  if (entry.attempts >= MAX_ATTEMPTS) return "too_many_attempts";

  entry.attempts++;

  const a = Buffer.from(submitted.trim().padEnd(6, "\0"));
  const b = Buffer.from(entry.code.padEnd(6, "\0"));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";

  store.delete(key); // one-time use
  return "ok";
}