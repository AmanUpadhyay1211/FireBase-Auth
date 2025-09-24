"use client"

import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { GuestOnlyRoute } from "@/components/auth/protected-route"
import { AuthPageSkeleton } from "@/components/ui/page-skeleton"

function ResetPasswordPageContent() {
  return (
    <div className="h-screen flex items-center justify-center p-4 gradient-mesh overflow-hidden">
      <ResetPasswordForm />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <GuestOnlyRoute fallback={<AuthPageSkeleton />}>
      <Suspense fallback={<AuthPageSkeleton />}>
        <ResetPasswordPageContent />
      </Suspense>
    </GuestOnlyRoute>
  )
}
