"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { HomePageSkeleton, AboutMePageSkeleton } from "@/components/ui/page-skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean // true = requires auth, false = requires no auth
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  redirectTo = "/auth/login", 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  if (loading) {
    return fallback || <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  if (!requireAuth && user) {
    return null // Will redirect
  }

  return <>{children}</>
}

// Specific components for different page types
export function AuthRequiredRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} fallback={<AboutMePageSkeleton />}>
      {children}
    </ProtectedRoute>
  )
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} fallback={<HomePageSkeleton />}>
      {children}
    </ProtectedRoute>
  )
}
