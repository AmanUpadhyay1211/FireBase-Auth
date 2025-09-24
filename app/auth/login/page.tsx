"use client"

import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { GuestOnlyRoute } from "@/components/auth/protected-route"
import { AuthPageSkeleton } from "@/components/ui/page-skeleton"

function LoginPageContent() {
  return (
    <div className="h-screen flex items-center justify-center p-4 gradient-mesh overflow-hidden">
      <LoginForm />
    </div>
  )
}

export default function LoginPage() {
  return (
    <GuestOnlyRoute fallback={<AuthPageSkeleton />}>
      <Suspense fallback={<AuthPageSkeleton />}>
        <LoginPageContent />
      </Suspense>
    </GuestOnlyRoute>
  )
}
