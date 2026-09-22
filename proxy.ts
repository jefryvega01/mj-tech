import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
