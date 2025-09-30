// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const rateLimit = (windowMs: number, max: number) => {
  const requestsMap: Record<string, { count: number; timestamp: number }> = {};

  return (req: NextRequest) => {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    if (!requestsMap[ip]) {
      requestsMap[ip] = { count: 1, timestamp: now };
    } else {
      const elapsed = now - requestsMap[ip].timestamp;

      if (elapsed < windowMs) {
        requestsMap[ip].count += 1;
        if (requestsMap[ip].count > max) {
          return NextResponse.json(
            { message: "Too many requests, please try again later." },
            { status: 429 },
          );
        }
      } else {
        requestsMap[ip] = { count: 1, timestamp: now };
      }
    }

    return null;
  };
};

const apiLimiter = rateLimit(60 * 1000, 1000);

export function middleware(req: NextRequest) {
  const limited = apiLimiter(req);
  if (limited) return limited;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
