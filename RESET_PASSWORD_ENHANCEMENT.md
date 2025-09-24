# 🔐 Enhanced Reset Password Implementation

This document outlines how to enhance the current reset password functionality with better UX, security, and user experience.

## 📋 Current Implementation Analysis

### ✅ What We Have
- Basic reset password form
- Firebase `sendPasswordResetEmail` integration
- Email validation and error handling
- Success state with email confirmation

### ❌ What's Missing
- Custom reset password page (currently uses Firebase's default)
- Password strength validation
- Reset token validation
- Better error handling
- User feedback and progress tracking
- Security enhancements

## 🎯 Enhanced Implementation Plan

### 1. Custom Reset Password Page

Instead of using Firebase's default reset page, create our own:

```typescript
// app/auth/reset-password/confirm/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export default function ConfirmResetPasswordPage() {
  const [loading, setLoading] = useState(true)
  const [validCode, setValidCode] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = searchParams.get("oobCode")

  useEffect(() => {
    if (oobCode) {
      verifyResetCode(oobCode)
    } else {
      setError("Invalid reset link")
      setLoading(false)
    }
  }, [oobCode])

  const verifyResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code)
      setValidCode(true)
    } catch (error) {
      setError("Invalid or expired reset link")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword)
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login?message=password-reset-success")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div>Verifying reset link...</div>
  }

  if (!validCode) {
    return <div>Invalid or expired reset link</div>
  }

  if (success) {
    return (
      <div className="text-center">
        <h2>Password Reset Successful!</h2>
        <p>Redirecting to login page...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handlePasswordReset}>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Reset Password</button>
    </form>
  )
}
```

### 2. Enhanced Reset Password Form

Improve the current form with better UX:

```typescript
// components/auth/enhanced-reset-password-form.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/ui/auth-card"
import { resetPassword } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ResetForm = z.infer<typeof resetSchema>

export function EnhancedResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")
  const [attempts, setAttempts] = useState(0)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    setAttempts(prev => prev + 1)
    
    try {
      await resetPassword(data.email)
      setEmail(data.email)
      setSent(true)
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      let errorMessage = "Please try again."
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address."
          break
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address."
          break
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later."
          break
        default:
          errorMessage = error.message || "Please try again."
      }
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={`We've sent password reset instructions to ${email}`}
      >
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            {attempts > 1 && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Multiple attempts detected. Please wait a few minutes.</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button 
              onClick={() => setSent(false)} 
              variant="outline" 
              className="w-full"
              disabled={attempts > 2}
            >
              Try different email
            </Button>

            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </motion.div>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard 
      title="Reset your password" 
      description="Enter your email address and we'll send you a reset link"
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                className="pl-10" 
                {...register("email")} 
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Button
              type="submit"
              className="w-full h-11 font-medium gradient-purple hover:opacity-90 transition-opacity"
              disabled={loading || attempts > 2}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send reset email"
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </AuthCard>
  )
}
```

### 3. Password Strength Validation

Add password strength validation for the reset form:

```typescript
// components/auth/password-strength.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    setChecks(newChecks)
    
    const score = Object.values(newChecks).filter(Boolean).length
    setStrength(score)
  }, [password])

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {getStrengthText()}
        </span>
      </div>

      <div className="space-y-1">
        {Object.entries(checks).map(([key, passed]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 text-sm ${
              passed ? "text-green-600 dark:text-green-400" : "text-gray-500"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passed
                  ? "border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {passed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
            </div>
            <span>
              {key === "length" && "At least 8 characters"}
              {key === "uppercase" && "One uppercase letter"}
              {key === "lowercase" && "One lowercase letter"}
              {key === "number" && "One number"}
              {key === "special" && "One special character"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Enhanced Firebase Auth Functions

Update the Firebase auth functions to handle reset password better:

```typescript
// lib/firebase/auth.ts - Enhanced functions

// Enhanced password reset with custom action code settings
export async function resetPassword(email: string): Promise<void> {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
    handleCodeInApp: true,
  }
  
  return sendPasswordResetEmail(auth, email, actionCodeSettings)
}

// Verify password reset code
export async function verifyPasswordResetCode(code: string) {
  return verifyPasswordResetCode(auth, code)
}

// Confirm password reset
export async function confirmPasswordReset(code: string, newPassword: string) {
  return confirmPasswordReset(auth, code, newPassword)
}

// Check if user exists
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email)
    return methods.length > 0
  } catch (error) {
    return false
  }
}
```

### 5. API Route for Reset Password

Create an API route to handle reset password logic:

```typescript
// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { resetPassword, checkUserExists } from "@/lib/firebase/auth"
import { z } from "zod"

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    // Check if user exists
    const userExists = await checkUserExists(email)
    
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address" },
        { status: 404 }
      )
    }

    // Send reset email
    await resetPassword(email)

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully"
    })

  } catch (error) {
    console.error("Reset password error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to send reset email" },
      { status: 500 }
    )
  }
}
```

### 6. Enhanced Error Handling

Create comprehensive error handling for reset password:

```typescript
// lib/utils/auth-errors.ts
export function getResetPasswordErrorMessage(error: any): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return "No account found with this email address."
    case 'auth/invalid-email':
      return "Please enter a valid email address."
    case 'auth/too-many-requests':
      return "Too many attempts. Please try again later."
    case 'auth/network-request-failed':
      return "Network error. Please check your connection."
    case 'auth/invalid-action-code':
      return "Invalid or expired reset link."
    case 'auth/expired-action-code':
      return "Reset link has expired. Please request a new one."
    case 'auth/weak-password':
      return "Password is too weak. Please choose a stronger password."
    default:
      return "An unexpected error occurred. Please try again."
  }
}
```

## 🎯 Implementation Steps

### Phase 1: Basic Enhancements
1. ✅ Update reset password form with better UX
2. ✅ Add attempt limiting and rate limiting
3. ✅ Improve error handling and user feedback
4. ✅ Add password strength validation

### Phase 2: Custom Reset Page
1. 🔄 Create custom reset password confirmation page
2. 🔄 Implement password strength validation
3. 🔄 Add success/error states
4. 🔄 Handle Firebase action codes

### Phase 3: Advanced Features
1. ⏳ Add email verification before reset
2. ⏳ Implement reset token expiration
3. ⏳ Add audit logging for security
4. ⏳ Create admin panel for password resets

## 🔒 Security Considerations

1. **Rate Limiting**: Prevent abuse of reset password functionality
2. **Token Expiration**: Ensure reset links expire after reasonable time
3. **Email Verification**: Verify email ownership before allowing reset
4. **Audit Logging**: Log all password reset attempts
5. **Password Strength**: Enforce strong password requirements

## 📱 User Experience Improvements

1. **Clear Instructions**: Better messaging and guidance
2. **Progress Indicators**: Show users what's happening
3. **Error Recovery**: Help users recover from errors
4. **Mobile Optimization**: Ensure mobile-friendly experience
5. **Accessibility**: Support screen readers and keyboard navigation

This enhanced implementation provides a much better user experience while maintaining security and following best practices for password reset functionality.
