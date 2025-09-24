import nodemailer from "nodemailer"
import { env } from "@/lib/env"

// Email configuration
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME || "Firebase Auth App"}" <${env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      const result = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", result.messageId)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string
  ): Promise<boolean> {
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm?token=${resetToken}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName || "there"}!</h2>
              <p>We received a request to reset your password for your account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The Firebase Auth App Team</p>
            </div>
            <div class="footer">
              <p>This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request
      
      Hello ${userName || "there"}!
      
      We received a request to reset your password for your account. If you made this request, visit the following link to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The Firebase Auth App Team
    `

    return this.sendEmail({
      to: email,
      subject: "🔐 Reset Your Password - Firebase Auth App",
      html,
      text,
    })
  }

  static async sendPasswordResetSuccessEmail(
    email: string,
    userName?: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName || "there"}!</h2>
              
              <div class="success">
                <strong>🎉 Success!</strong> Your password has been successfully reset.
              </div>
              
              <p>Your account is now secure with your new password. You can now sign in to your account using your new password.</p>
              
              <p>If you didn't make this change or if you have any concerns, please contact our support team immediately.</p>
              
              <p>Best regards,<br>The Firebase Auth App Team</p>
            </div>
            <div class="footer">
              <p>This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: "✅ Password Reset Successful - Firebase Auth App",
      html,
    })
  }
}
