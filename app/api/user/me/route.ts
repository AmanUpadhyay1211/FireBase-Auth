import { type NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { UserService } from "@/lib/database/services/user-service"
import { verifyJWT } from "@/lib/utils/jwt-server"

export async function GET(request: NextRequest) {
  try {
    // Try Firebase ID token first (from Authorization header)
    const authHeader = request.headers.get("authorization")
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (idToken) {
      const firebaseResult = await verifyIdToken(idToken)

      if (firebaseResult.success) {
        const { decodedToken } = firebaseResult
        const user = await UserService.findByUid(decodedToken.uid)

        if (user) {
          return NextResponse.json({
            success: true,
            user: {
              uid: user.uid,
              email: user.email,
              name: user.name,
              provider: user.provider,
              photoURL: user.photoURL,
              lastSeen: user.lastSeen,
            },
            source: "firebase",
          })
        }
      }
    }

    // Fallback to session cookie
    const sessionCookie = request.cookies.get("app_session")

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "No authentication found" }, { status: 401 })
    }

    // Verify JWT session
    const payload = verifyJWT(sessionCookie.value)

    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Validate session in database
    const isValidSession = await UserService.validateUserSession(payload.uid, sessionCookie.value)

    if (!isValidSession) {
      return NextResponse.json({ success: false, error: "Session expired or invalid" }, { status: 401 })
    }

    // Get user from database
    const user = await UserService.findByUid(payload.uid)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        provider: user.provider,
        photoURL: user.photoURL,
        lastSeen: user.lastSeen,
      },
      source: "database",
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
