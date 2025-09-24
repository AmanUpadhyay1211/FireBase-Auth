import type { NextRequest } from "next/server"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string
    email: string
    name: string | null
    provider: string
    photoURL: string | null
  }
}

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get("app_session")

    if (!sessionCookie) {
      return null
    }

    const cookieParts = sessionCookie.value.split(".")
    if (cookieParts.length !== 3) {
      return null
    }

    try {
      // Decode JWT payload (without verification for Edge Runtime)
      const payload = JSON.parse(atob(cookieParts[1]))

      // Return basic user info from JWT payload
      return {
        uid: payload.uid,
        email: payload.email,
        name: payload.name || null,
        provider: payload.provider || "unknown",
        photoURL: payload.photoURL || null,
      }
    } catch (decodeError) {
      console.error("JWT decode error:", decodeError)
      return null
    }
  } catch (error) {
    console.error("Authentication middleware error:", error)
    return null
  }
}

export async function getAuthenticatedUserWithValidation(request: NextRequest) {
  try {
    // This function should only be used in API routes where we have Node.js runtime
    const { UserService } = await import("@/lib/database/services/user-service")
    const { verifyJWT } = await import("@/lib/utils/jwt-server")

    const sessionCookie = request.cookies.get("app_session")

    if (!sessionCookie) {
      return null
    }

    const payload = verifyJWT(sessionCookie.value)

    if (!payload) {
      return null
    }

    // Validate session in database (only in Node.js runtime)
    const isValidSession = await UserService.validateUserSession(payload.uid, sessionCookie.value)

    if (!isValidSession) {
      return null
    }

    // Get user from database
    const user = await UserService.findByUid(payload.uid)

    if (!user) {
      return null
    }

    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      provider: user.provider,
      photoURL: user.photoURL,
    }
  } catch (error) {
    console.error("Authentication middleware error:", error)
    return null
  }
}

export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUserWithValidation(request)

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return handler(authenticatedRequest)
  }
}
