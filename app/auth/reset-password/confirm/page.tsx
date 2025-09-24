"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/ui/auth-card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { PasswordStrength } from "@/components/auth/password-strength"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

interface UserInfo {
  email: string
  name?: string
}

export default function ConfirmResetPasswordPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch("password")

  useEffect(() => {
    if (token) {
      verifyToken(token)
    } else {
      setError("Invalid reset link")
      setLoading(false)
    }
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password/verify?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setValidToken(true)
        setUserInfo(data.user)
      } else {
        setError(data.error || "Invalid or expired reset link")
      }
    } catch (error) {
      console.error("Token verification error:", error)
      setError("Failed to verify reset link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        toast({
          title: "Password Reset Successful!",
          description: "Your password has been updated successfully.",
        })

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?message=password-reset-success")
        }, 3000)
      } else {
        setError(result.error || "Failed to reset password")
        toast({
          title: "Reset Failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Reset Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
        <AuthCard title="Verifying Reset Link" description="Please wait while we verify your reset link">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </AuthCard>
      </div>
    )
  }

  if (!validToken || error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
        <AuthCard title="Invalid Reset Link" description={error || "This reset link is invalid or has expired"}>
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              Please request a new password reset link.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/auth/reset-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </motion.div>
          </div>
        </AuthCard>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
        <AuthCard title="Password Reset Successful!" description="Your password has been updated successfully">
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              Redirecting to login page...
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/auth/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <AuthCard 
        title="Set New Password" 
        description={`Reset password for ${userInfo?.email}`}
      >
        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </motion.div>

            {password && <PasswordStrength password={password} />}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full h-11 font-medium gradient-purple hover:opacity-90 transition-opacity"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
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
    </div>
  )
}
