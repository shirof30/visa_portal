import { NextRequest, NextResponse } from "next/server";
import { sendConfirmationEmail } from "@/lib/sendConfirmationEmail";
import {
  rescheduleSlotByRegistrationId,
  getSubmissionByRegistrationIdAndDob,
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
function getSlotCapacity(slotIso: string): number {
  const dateStr = slotIso.split("T")[0];
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return (dow === 0 || dow === 6) ? 5 : 3;
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.registrationId || !body?.slotIso || !body?.dateOfBirth) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }


  const existing = await getSubmissionByRegistrationIdAndDob(body.registrationId, body.dateOfBirth);
  if (!existing) {
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
  const result = await rescheduleSlotByRegistrationId(body.registrationId, body.slotIso, capacity);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  await sendConfirmationEmail({
    toEmail: existing.email,
    fullName: existing.fullName,
    applicationRef: result.submission.applicationRef,
    reason: existing.reason,
    appointmentSlot: result.submission.appointmentSlot!,
  });
  return NextResponse.json({
    applicationRef: result.submission.applicationRef,
    appointmentSlot: result.submission.appointmentSlot,
  });
}
