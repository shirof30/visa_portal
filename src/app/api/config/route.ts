import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/siteConfig";

export async function GET() {
  const cfg = await getSiteConfig();
  return NextResponse.json(cfg);
}
