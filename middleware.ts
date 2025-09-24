import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/about-me", "/dashboard", "/profile"]
  
  // Guest-only routes (auth pages)
  const guestOnlyRoutes = ["/auth/login", "/auth/signup", "/auth/reset-password"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get("app_session")

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const cookieParts = sessionCookie.value.split(".")
    if (cookieParts.length !== 3) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Allow the request to continue - actual JWT verification happens in server components/API routes
    return NextResponse.next()
  }

  // For guest-only routes, redirect to about-me if user is already authenticated
  if (isGuestOnlyRoute) {
    const sessionCookie = request.cookies.get("app_session")
    
    if (sessionCookie?.value) {
      const cookieParts = sessionCookie.value.split(".")
      if (cookieParts.length === 3) {
        // User appears to be authenticated, redirect to about-me
        return NextResponse.redirect(new URL("/about-me", request.url))
      }
    }
  }

  // For root path, redirect based on authentication status
  if (pathname === "/") {
    const sessionCookie = request.cookies.get("app_session")
    
    if (sessionCookie?.value) {
      const cookieParts = sessionCookie.value.split(".")
      if (cookieParts.length === 3) {
        // User appears to be authenticated, redirect to about-me
        return NextResponse.redirect(new URL("/about-me", request.url))
      }
    }
    // If not authenticated, allow access to home page
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
