import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // If user is authenticated and trying to access login/membership pages, redirect to members portal
    if (token && (pathname === "/members-login" || pathname === "/membership")) {
      return NextResponse.redirect(new URL("/members-portal", req.url));
    }

    // If user is not authenticated and trying to access protected pages, redirect to login
    if (!token && pathname.startsWith("/members-portal")) {
      return NextResponse.redirect(new URL("/members-login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow all requests to pass through, we'll handle redirects in the middleware function
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/members-login",
    "/membership", 
    "/members-portal/:path*"
  ],
}; 