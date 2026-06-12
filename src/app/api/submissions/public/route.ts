// src/app/api/submissions/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSubmissionByRef, listSubmissionsBySlotDateRange } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const ref = searchParams.get("ref");
  if (ref) {
    const sub = await getSubmissionByRef(ref);
    if (!sub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      applicationRef: sub.applicationRef,
      fullName: sub.fullName,
      reason: sub.reason,
      appointmentSlot: sub.appointmentSlot,
      createdAt: sub.createdAt,
    });
  }
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!from || !to || !YMD_RE.test(from) || !YMD_RE.test(to)) {
    return NextResponse.json({ error: "Missing or invalid date params. Use YYYY-MM-DD." }, { status: 400 });
  }

  const items = await listSubmissionsBySlotDateRange(from, to);

  const minimal = items
    .filter((s) => !!s.appointmentSlot)
    .map((s) => ({
      appointmentSlot: s.appointmentSlot,
    }));

  return NextResponse.json(minimal);
}
