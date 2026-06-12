// src/app/api/visits/route.ts
import { NextResponse } from "next/server";
import { incrementVisits, getVisits } from "@/lib/visits";

export async function POST() {
  const total = await incrementVisits();
  return NextResponse.json({ total });
}

export async function GET() {
  const total = await getVisits();
  return NextResponse.json({ total });
}
