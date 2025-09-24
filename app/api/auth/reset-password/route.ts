import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ResetTokenService } from "@/lib/services/reset-token-service"

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

const confirmResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// POST /api/auth/reset-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    // Create reset request
    const result = await ResetTokenService.createResetRequest(email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Reset password request error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    }, { status: 500 })
  }
}

// PUT /api/auth/reset-password - Confirm password reset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = confirmResetSchema.parse(body)

    // Reset password with token
    const result = await ResetTokenService.resetPasswordWithToken(token, password)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Confirm reset password error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    }, { status: 500 })
  }
}

