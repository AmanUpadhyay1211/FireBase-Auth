import { type NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { UserService } from "@/lib/database/services/user-service"
import { signJWT, getJWTExpiration, generateSessionId, verifyJWT } from "@/lib/utils/jwt-server"
import { z } from "zod"

const refreshRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = refreshRequestSchema.parse(body)

    // Verify Firebase ID token
    const firebaseResult = await verifyIdToken(idToken)

    if (!firebaseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid ID token", details: firebaseResult.error },
        { status: 401 },
      )
    }

    const { decodedToken } = firebaseResult

    // Get existing session cookie
    const existingSessionCookie = request.cookies.get("app_session")

    if (existingSessionCookie) {
      // Remove old session
      const oldPayload = verifyJWT(existingSessionCookie.value)
      if (oldPayload) {
        try {
          await UserService.removeUserSession(oldPayload.uid, existingSessionCookie.value)
        } catch (error) {
          console.error("Failed to remove old session:", error)
        }
      }
    }

    // Get user agent and IP for session tracking
    const userAgent = request.headers.get("user-agent") || undefined
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    // Generate new session
    const sessionId = generateSessionId()
    const expiresAt = getJWTExpiration()

    // Create JWT payload
    const jwtPayload = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      sessionId,
    }

    // Sign new JWT
    const sessionToken = signJWT(jwtPayload)

    // Store new session in database
    await UserService.addUserSession(decodedToken.uid, sessionToken, expiresAt, userAgent, ip)

    // Get updated user data
    const user = await UserService.findByUid(decodedToken.uid)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Set new httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        provider: user.provider,
        photoURL: user.photoURL,
      },
    })

    response.cookies.set("app_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session refresh error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
