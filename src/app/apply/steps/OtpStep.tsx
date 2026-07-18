"use client";

import React, { useState, useRef, useEffect } from "react";
import SectionCard from "../ui/SectionCard";

interface OtpStepProps {
  phoneNumber: string; // 10-digit unformatted (used as OTP key)
  email: string;       // where the code is sent
  onVerified: () => void;
}

export default function OtpStep({ phoneNumber, email, onVerified }: OtpStepProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mask email for display: e.g. jo***@gmail.com
  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c);

  useEffect(() => { sendOtp(); }, []);

  useEffect(() => { if (status === "sent") inputRefs.current[0]?.focus(); }, [status]);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [cooldown]);

  async function sendOtp() {
    setStatus("sending");
    setErrorMsg("");
    setDigits(["", "", "", "", "", ""]);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.error ?? "Failed to send code."); return; }
      setStatus("sent");
      setCooldown(60);
    } catch {
      setStatus("error");
      setErrorMsg("Connection failed. Please try again.");
    }
  }

  async function verifyOtpWithCode(code: string) {
    setStatus("verifying");
    setErrorMsg("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("sent");
        setErrorMsg(data.error ?? "Incorrect code.");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        return;
      }
      onVerified();
    } catch {
      setStatus("sent");
      setErrorMsg("Connection failed. Please try again.");
    }
  }

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrorMsg("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && next.every((d) => d !== "")) {
      setTimeout(() => verifyOtpWithCode(next.join("")), 100);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setErrorMsg("");
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => verifyOtpWithCode(pasted), 100);
  }

  const isVerifying = status === "verifying";
  const isSending = status === "sending";
  const codeComplete = digits.every((d) => d !== "");

  return (
    <SectionCard
      subtitle="A 6-digit verification code has been sent to your email address."
    >
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Email display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Code sent to</p>
          <p className="text-base font-semibold text-gray-800">{maskedEmail}</p>
          {isSending && <p className="text-sm text-red-600 mt-2 animate-pulse">Sending email…</p>}
          {(status === "sent" || isVerifying) && (
            <p className="text-sm text-green-600 mt-2">✓ Email sent successfully</p>
          )}
        </div>

        {/* 6-digit input */}
        <div className="flex gap-3" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              disabled={isVerifying || isSending}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={[
                "w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 outline-none transition",
                "focus:border-red-500 focus:ring-2 focus:ring-red-100",
                errorMsg ? "border-red-400 bg-red-50" : d ? "border-green-400 bg-green-50" : "border-gray-300 bg-white",
                (isVerifying || isSending) ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            />
          ))}
        </div>

        {isVerifying && <p className="text-sm text-red-600 animate-pulse">Verifying…</p>}

        {/* Manual verify button (fallback) */}
        {status === "sent" && codeComplete && !isVerifying && (
          <button
            type="button"
            onClick={() => verifyOtpWithCode(digits.join(""))}
            className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Verify
          </button>
        )}

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center max-w-xs">
            {errorMsg}
          </div>
        )}

        {/* Resend */}
        <p className="text-sm text-gray-500 text-center">
          Didn&apos;t receive the email?{" "}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={sendOtp}
              disabled={isSending}
              className="text-red-600 font-semibold hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          )}
        </p>

        <p className="text-xs text-gray-400 text-center max-w-xs">
          Check your <strong>spam folder</strong> if you don&apos;t see it. The code is valid for 10 minutes.
        </p>
      </div>
    </SectionCard>
  );
}
