// src/app/api/submissions/check-ld/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const COMPLETED_STATUS = "Paspor selesai diproses";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ld = searchParams.get("ld")?.trim();

  if (!ld) {
    return NextResponse.json({ exists: false });
  }

  const existing = await prisma.submission.findFirst({
    where: {
      registrationId: ld,
      NOT: { status: COMPLETED_STATUS },
    },
    select: {
      applicationRef: true,
      status: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    exists: true,
    applicationRef: existing.applicationRef,
    status: existing.status,
  });
}
