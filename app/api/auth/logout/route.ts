import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/database/services/user-service"
import { verifyJWT } from "@/lib/utils/jwt-server"

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("app_session")

    if (sessionCookie) {
      // Verify and remove session from database
      const payload = verifyJWT(sessionCookie.value)

      if (payload) {
        try {
          await UserService.removeUserSession(payload.uid, sessionCookie.value)
        } catch (error) {
          console.error("Failed to remove session from database:", error)
          // Continue with logout even if database removal fails
        }
      }
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    response.cookies.set("app_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
