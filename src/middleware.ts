import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth needed
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const user = req.auth?.user as Record<string, unknown> | undefined;

  // Not authenticated — redirect to login
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (user.role as string) || "member";

  // Route access rules
  const adminRoutes = [
    "/people", "/stripe", "/managers", "/board", "/committees",
    "/resources", "/memberships", "/surveys", "/inventory",
    "/news", "/coaches",
  ];
  const nfRoutes = [
    "/clubs", "/technical-officials", "/to-training", "/courses",
  ];
  const clubRoutes = ["/club"];
  const ifRoutes = ["/federation"];

  // IF admin routes
  if (ifRoutes.some((r) => pathname.startsWith(r))) {
    if (role !== "if_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // NF admin routes (nf_admin + if_admin)
  if (adminRoutes.some((r) => pathname.startsWith(r)) || nfRoutes.some((r) => pathname.startsWith(r))) {
    if (role !== "nf_admin" && role !== "if_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Club admin routes (club_admin + nf_admin + if_admin)
  if (clubRoutes.some((r) => pathname.startsWith(r))) {
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
