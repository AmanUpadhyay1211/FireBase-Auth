"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/ui/auth-card"
import { OAuthButton } from "@/components/ui/oauth-button"
import { signInWithEmail, signInWithGoogle, signInWithGithub } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const redirectTo = searchParams.get("redirect") || "/about-me"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      await signInWithEmail(data.email, data.password)
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })
      router.push(redirectTo)
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome!",
        description: "You have been successfully signed in with Google.",
      })
      router.push(redirectTo)
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
      toast({
        title: "Welcome!",
        description: "You have been successfully signed in with GitHub.",
      })
      router.push(redirectTo)
    } catch (error: any) {
      toast({
        title: "GitHub sign in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthCard title="Welcome back" description="Sign in to your account to continue">
      <div className="space-y-4">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <OAuthButton provider="google" onClick={handleGoogleSignIn} disabled={loading} />
          <OAuthButton provider="github" onClick={handleGithubSignIn} disabled={loading} />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Email/Password Form */}
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
              <Input id="email" type="email" placeholder="Enter your email" className="pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
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
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Button
              type="submit"
              className="w-full h-11 font-medium gradient-purple hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground"
        >
          {"Don't have an account? "}
          <Link href="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </motion.div>
      </div>
    </AuthCard>
  )
}
