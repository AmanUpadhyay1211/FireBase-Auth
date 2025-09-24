import jwt from "jsonwebtoken"
import { env } from "@/lib/env"
import { UserService } from "@/lib/database/services/user-service"

export interface ResetTokenPayload {
  userId: string
  email: string
  type: "password_reset"
  iat: number
  exp: number
}

export class ResetTokenService {
  private static readonly TOKEN_EXPIRY = "1h" // 1 hour
  private static readonly JWT_SECRET = env.JWT_SECRET

  /**
   * Generate a password reset token for a user
   */
  static generateResetToken(userId: string, email: string): string {
    const payload: Omit<ResetTokenPayload, "iat" | "exp"> = {
      userId,
      email,
      type: "password_reset",
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
    })
  }

  /**
   * Verify and decode a reset token
   */
  static verifyResetToken(token: string): ResetTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as ResetTokenPayload
      
      // Verify token type
      if (decoded.type !== "password_reset") {
        return null
      }

      return decoded
    } catch (error) {
      console.error("Invalid reset token:", error)
      return null
    }
  }

  /**
   * Check if a reset token is valid and not expired
   */
  static isTokenValid(token: string): boolean {
    const payload = this.verifyResetToken(token)
    return payload !== null
  }

  /**
   * Get user from reset token
   */
  static async getUserFromToken(token: string) {
    const payload = this.verifyResetToken(token)
    if (!payload) {
      return null
    }

    try {
      const user = await UserService.findByEmail(payload.email)
      return user
    } catch (error) {
      console.error("Error fetching user from token:", error)
      return null
    }
  }

  /**
   * Validate that the token belongs to the current user session
   */
  static async validateTokenForUser(token: string, currentUserId: string): Promise<boolean> {
    const payload = this.verifyResetToken(token)
    if (!payload) {
      return false
    }

    // Check if token belongs to the current user
    return payload.userId === currentUserId
  }

  /**
   * Create a reset token and send email
   */
  static async createResetRequest(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await UserService.findByEmail(email)
      if (!user) {
        return {
          success: false,
          message: "No account found with this email address"
        }
      }

      // Generate reset token
      const resetToken = this.generateResetToken(user._id.toString(), user.email)

      // Send reset email
      const { EmailService } = await import("./email-service")
      const emailSent = await EmailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || user.email
      )

      if (!emailSent) {
        return {
          success: false,
          message: "Failed to send reset email. Please try again."
        }
      }

      return {
        success: true,
        message: "Password reset email sent successfully"
      }
    } catch (error) {
      console.error("Error creating reset request:", error)
      return {
        success: false,
        message: "An error occurred. Please try again."
      }
    }
  }

  /**
   * Reset password using token
   */
  static async resetPasswordWithToken(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify token
      const payload = this.verifyResetToken(token)
      if (!payload) {
        return {
          success: false,
          message: "Invalid or expired reset token"
        }
      }

      // Get user
      const user = await UserService.findByEmail(payload.email)
      if (!user) {
        return {
          success: false,
          message: "User not found"
        }
      }

      // Update password in Firebase
      const { getAdminAuth } = await import("@/lib/firebase/admin")
      const adminAuth = getAdminAuth()
      
      await adminAuth.updateUser(user.uid, {
        password: newPassword
      })

      // Send success email
      const { EmailService } = await import("./email-service")
      await EmailService.sendPasswordResetSuccessEmail(
        user.email,
        user.name || user.email
      )

      return {
        success: true,
        message: "Password reset successfully"
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      return {
        success: false,
        message: "Failed to reset password. Please try again."
      }
    }
  }
}
