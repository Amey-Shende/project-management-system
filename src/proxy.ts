import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Public auth endpoints
    if (pathname.startsWith("/api/auth/")) {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;
    const isApiRoute = pathname.startsWith("/api/");

    if (!token) {
        if (isApiRoute) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // No token - redirect with session_expired flag (client will check localStorage)
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("session_expired", "true");
        return NextResponse.redirect(loginUrl);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        if (isApiRoute) {
            const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            response.cookies.delete("token");
            return response;
        }

        // Token exists but is invalid/expired
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("session_expired", "true");
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        return response;
    }

    // Forward trusted user id to route handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-user-id"); // prevent spoofing
    requestHeaders.delete("x-user-role"); // prevent spoofing
    requestHeaders.delete("x-user-name"); // prevent spoofing
    requestHeaders.set("x-user-id", String(decoded.userId));
    requestHeaders.set("x-user-role", String(decoded.role));
    requestHeaders.set("x-user-name", String(decoded.name)); // Add this

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;

}

export const config = {
    matcher: ["/api/:path*", "/dashboard", "/dashboard/:path*"],
};