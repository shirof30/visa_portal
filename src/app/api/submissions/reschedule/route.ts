import { NextRequest, NextResponse } from "next/server";
import { sendConfirmationEmail } from "@/lib/sendConfirmationEmail";
import {
  rescheduleSlotByRegistrationId,
  getSubmissionByRegistrationIdAndDob,
  getSubmissionByRef,
  bookSlot,
} from "@/lib/db";


function vancouverDateStr(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // YYYY-MM-DD
}

function isLockedSameDayOrPast(slotIso: string | null) {
  if (!slotIso) return false; // if not scheduled yet, allow
  const apptDate = vancouverDateStr(new Date(slotIso));
  const today = vancouverDateStr(new Date());
  return apptDate <= today; // today OR past
}
function getSlotCapacity(_slotIso: string): number {
  // Visa appointments allow a maximum of 2 applications per time slot.
  // Keep this aligned with AppointmentPageClient.tsx.
  return 2;
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const hasRegistrationId = typeof body?.registrationId === "string" && body.registrationId.trim();
  const hasApplicationRef = typeof body?.applicationRef === "string" && body.applicationRef.trim();

  if ((!hasRegistrationId && !hasApplicationRef) || !body?.slotIso || !body?.dateOfBirth) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = hasApplicationRef
    ? await getSubmissionByRef(body.applicationRef.trim())
    : await getSubmissionByRegistrationIdAndDob(body.registrationId, body.dateOfBirth);

  const verified = existing && (
    hasApplicationRef
      ? existing.dateOfBirth.trim() === String(body.dateOfBirth).trim()
      : true
  );

  if (!verified || !existing) {
    return NextResponse.json({ error: "Verifikasi Tanggal Lahir Gagal, Silahkan Ulang Kembali" }, { status: 403 });
  }


  if (isLockedSameDayOrPast(existing.appointmentSlot)) {
    return NextResponse.json(
      { error: "Jadwal tidak dapat diubah pada hari yang sama." },
      { status: 400 }
    );
  }

  if (isLockedSameDayOrPast(body.slotIso)) {
    return NextResponse.json(
      { error: "Tidak bisa memilih jadwal pada hari yang sama." },
      { status: 400 }
    );
  }

  const capacity = getSlotCapacity(body.slotIso);

  let updated;
  if (hasApplicationRef) {
    updated = await bookSlot(existing.id, body.slotIso, capacity);
    if (!updated) {
      return NextResponse.json({ error: "Slot sudah penuh" }, { status: 400 });
    }
  } else {
    const result = await rescheduleSlotByRegistrationId(body.registrationId, body.slotIso, capacity);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    updated = result.submission;
  }

  await sendConfirmationEmail({
    toEmail: existing.email,
    fullName: existing.fullName,
    applicationRef: updated.applicationRef,
    reason: existing.reason,
    appointmentSlot: updated.appointmentSlot!,
  });
  return NextResponse.json({
    applicationRef: updated.applicationRef,
    appointmentSlot: updated.appointmentSlot,
  });
}
