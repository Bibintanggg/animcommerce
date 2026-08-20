import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const role = request.cookies.get("role")?.value;

	if (
		request.nextUrl.pathname.startsWith("/admin") &&
		role !== "admin" &&
		role !== "superadmin"
	) {
		return NextResponse.redirect(new URL("/403", request.url));
	}

	if (
		request.nextUrl.pathname.startsWith("/superadmin") &&
		role !== "superadmin"
	) {
		return NextResponse.redirect(new URL("/403", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/superadmin/:path*"],
};
