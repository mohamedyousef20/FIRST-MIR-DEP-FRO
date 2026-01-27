// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(process.env.JWT_ACCESS_SECRET,'desgd')
  // تحقق من وجود الـ JWT secret
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

  if (!JWT_ACCESS_SECRET) {
    console.error("❌ JWT_ACCESS_SECRET is missing in .env.local");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  console.log("JWT_ACCESS_SECRET exists:", !!process.env.JWT_ACCESS_SECRET);
  console.log("JWT_ACCESS_SECRET length:", process.env.JWT_ACCESS_SECRET?.length);

  const SECRET_KEY = new TextEncoder().encode(JWT_ACCESS_SECRET);

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  // Get token from multiple possible sources
  let token = request.cookies.get("accessToken")?.value;

  // If no cookie, check Authorization header
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  console.log("🔍 Middleware checking:", {
    path: pathname,
    hasToken: !!token,
    tokenLength: token?.length
  });

  if (!token) {
    console.log("🚫 No token found, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const decoded: any = payload;

    console.log("✅ User authenticated:", {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    });
    console.log(decoded.role,'decoded.role')
    console.log(decoded,'decoded')
    // Role-based protection
    if (pathname.startsWith("/admin") && decoded.role !== "admin") {
      console.log(`⛔ User ${decoded.role} trying to access admin area`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/vendor") && decoded.role !== "seller") {
      console.log(`⛔ User ${decoded.role} trying to access vendor area`);
      // return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/driver") && decoded.role !== "driver") {
      console.log(`⛔ User ${decoded.role} trying to access driver area`);
      // return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.id);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-email", decoded.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Token verification failed:", {
      error: error.message,
      code: error.code
    });

    // Clear invalid cookie
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");

    return response;
  }
}

export const config = {
  matcher: [
    "/account/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/driver/:path*",
  ],
};