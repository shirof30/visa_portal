import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const MAINTENANCE_MODE = false;
const YOUR_IP = "173.180.243.149";

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  if (MAINTENANCE_MODE) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "";

    if (ip !== YOUR_IP) {
      const pathname = req.nextUrl.pathname;
      const isMaintenance =
        pathname === "/maintenance" ||
        pathname.endsWith("/maintenance");

      if (!isMaintenance) {
        const url = req.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.rewrite(url);
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
