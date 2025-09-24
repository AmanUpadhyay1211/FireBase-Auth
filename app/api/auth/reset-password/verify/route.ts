import { NextRequest, NextResponse } from "next/server"
import { ResetTokenService } from "@/lib/services/reset-token-service"

// GET /api/auth/reset-password/verify - Verify reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Reset token is required"
      }, { status: 400 })
    }

    // Verify token
    const isValid = ResetTokenService.isTokenValid(token)
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired reset token"
      }, { status: 400 })
    }

    // Get user info
    const user = await ResetTokenService.getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error("Verify reset token error:", error)
    
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    }, { status: 500 })
  }
}

