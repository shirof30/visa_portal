import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const row = await (prisma as any).siteConfig.findUnique({ where: { id: 1 } });
    return NextResponse.json({ text: row?.announcement?.trim() ?? "" });
  } catch {
    return NextResponse.json({ text: "" });
  }
}