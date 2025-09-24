import { type NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { UserService } from "@/lib/database/services/user-service"
import { signJWT, getJWTExpiration, generateSessionId, verifyJWT } from "@/lib/utils/jwt-server"
import { z } from "zod"

const sessionRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = sessionRequestSchema.parse(body)

    // Get user agent and IP for session tracking
    const userAgent = request.headers.get("user-agent") || undefined
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    // Try to verify Firebase ID token first
    const firebaseResult = await verifyIdToken(idToken)

    if (!firebaseResult.success) {
      // Firebase verification failed - check if we have an existing session as fallback
      const existingSessionCookie = request.cookies.get("app_session")

      if (existingSessionCookie) {
        // Try to use existing session as fallback
        const fallbackResponse = await handleSessionFallback(existingSessionCookie.value)
        if (fallbackResponse) {
          return fallbackResponse
        }
      }

      return NextResponse.json(
        { success: false, error: "Authentication failed", details: firebaseResult.error },
        { status: 401 },
      )
    }

    const { decodedToken } = firebaseResult

    // Extract user data from Firebase token
    const userData = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || decodedToken.email?.split("@")[0] || null,
      provider: getProviderFromToken(decodedToken),
      photoURL: decodedToken.picture || null,
    }

    // Upsert user in database
    const user = await UserService.upsertUser(userData)

    // Generate session
    const sessionId = generateSessionId()
    const expiresAt = getJWTExpiration()

    // Create JWT payload
    const jwtPayload = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      provider: user.provider,
      photoURL: user.photoURL,
      sessionId,
    }

    // Sign JWT
    const sessionToken = signJWT(jwtPayload)

    // Store session in database (hashed)
    await UserService.addUserSession(user.uid, sessionToken, expiresAt, userAgent, ip)

    // Set httpOnly cookie
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
    console.error("Session creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function handleSessionFallback(sessionToken: string) {
  try {
    const payload = verifyJWT(sessionToken)

    if (!payload) {
      return null
    }

    // Validate session in database
    const isValidSession = await UserService.validateUserSession(payload.uid, sessionToken)

    if (!isValidSession) {
      return null
    }

    // Get user from database
    const user = await UserService.findByUid(payload.uid)

    if (!user) {
      return null
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        provider: user.provider,
        photoURL: user.photoURL,
      },
      fallback: true,
    })
  } catch (error) {
    console.error("Session fallback error:", error)
    return null
  }
}

function getProviderFromToken(token: any): "email" | "google" | "github" {
  if (token.firebase?.sign_in_provider) {
    const provider = token.firebase.sign_in_provider
    if (provider === "google.com") return "google"
    if (provider === "github.com") return "github"
  }
  return "email"
}
