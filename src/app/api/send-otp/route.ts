// src/app/api/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/otpStore";

// Rate-limit: max 3 sends per email per 10 min window (in-memory)
const sendLog = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const times = (sendLog.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (times.length >= RATE_MAX) return true;
  times.push(now);
  sendLog.set(key, times);
  return false;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token");
  return data.access_token as string;
}

async function sendOtpEmail(toEmail: string, code: string): Promise<void> {
  const token = await getAccessToken();

  const emailBody = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: #0d2b5e; padding: 20px 24px; border-bottom: 3px solid #c0392b;">
        <p style="color: rgba(255,255,255,0.6); font-size: 11px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 4px 0;">KJRI Vancouver</p>
        <h2 style="color: white; margin: 0; font-size: 18px;">Email Verification Code</h2>
      </div>
      <div style="padding: 32px 24px; background: #f8f7f4;">
        <p style="margin: 0 0 20px 0; color: #444; font-size: 14px;">
          Use the following code to verify your email address:
        </p>
        <div style="background: white; border-radius: 12px; padding: 28px; text-align: center; border: 1px solid #e8e5df; margin-bottom: 20px;">
          <div style="font-size: 42px; font-weight: 900; color: #0d2b5e; font-family: monospace; letter-spacing: 0.2em;">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px; margin: 12px 0 0 0;">Valid for 10 minutes</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px;">
          <p style="margin: 0; font-size: 12px; color: #92400e;">
            ⚠️ Never share this code with anyone. KJRI Vancouver will never ask for this code.
          </p>
        </div>
      </div>
      <div style="background: #0d2b5e; padding: 14px; text-align: center;">
        <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0;">Consulate General of the Republic of Indonesia — Vancouver</p>
      </div>
    </div>
  `;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${process.env.MAIL_FROM}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: "Email Verification Code — KJRI Vancouver",
          body: { contentType: "HTML", content: emailBody },
          toRecipients: [{ emailAddress: { address: toEmail } }],
          from: { emailAddress: { address: process.env.MAIL_FROM, name: "KJRI Vancouver" } },
        },
        saveToSentItems: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph API error: ${err}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();
    const digits = String(phone ?? "").replace(/\D/g, "");
    const emailAddr = String(email ?? "").trim();

    if (digits.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }
    if (!emailAddr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (isRateLimited(digits)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const code = createOtp(digits, emailAddr);
    await sendOtpEmail(emailAddr, code);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[send-otp]", e);
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }
}