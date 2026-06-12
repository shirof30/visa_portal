import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = false; // ← flip to true when doing maintenance
const YOUR_IP = "173.180.243.149";

export function middleware(req: NextRequest) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "";

  if (ip === YOUR_IP) return NextResponse.next();

  if (req.nextUrl.pathname !== "/maintenance") {
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};