// src/app/api/submissions/verify-ref/route.ts
// Verifies applicationRef + dateOfBirth, returns the internal submission id
// only on a successful match. The UUID never appears in the booking link.
import { NextRequest, NextResponse } from "next/server";
import { getSubmissionByRef } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.applicationRef || !body?.dateOfBirth) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sub = await getSubmissionByRef(body.applicationRef.trim());

  // Always return 403 on any mismatch — don't reveal whether the ref exists
  if (!sub || sub.dateOfBirth.trim() !== body.dateOfBirth.trim()) {
    return NextResponse.json(
      { error: "Verifikasi Tanggal Lahir Gagal. Silahkan coba kembali." },
      { status: 403 }
    );
  }

  // Only return the minimum needed to proceed: internal id, name, and service
  return NextResponse.json({
    id: sub.id,
    fullName: sub.fullName,
    reason: sub.reason,
    appointmentSlot: sub.appointmentSlot,
  });
}