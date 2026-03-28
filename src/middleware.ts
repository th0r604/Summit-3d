import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const user = req.auth?.user as Record<string, unknown> | undefined;

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (user.role as string) || "member";

  const nfAdminRoutes = [
    "/people", "/stripe", "/managers", "/board", "/committees",
    "/resources", "/memberships", "/surveys", "/inventory",
    "/news", "/coaches", "/clubs", "/technical-officials",
    "/to-training", "/courses", "/if3-sync", "/circle21",
  ];

  if (nfAdminRoutes.some((r) => pathname.startsWith(r))) {
    if (role !== "nf_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/club")) {
    if (role === "member") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/schema).*)",
  ],
};
