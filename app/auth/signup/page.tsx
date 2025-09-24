"use client"

import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { GuestOnlyRoute } from "@/components/auth/protected-route"
import { AuthPageSkeleton } from "@/components/ui/page-skeleton"

function SignupPageContent() {
  return (
    <div className="h-screen flex items-center justify-center p-4 gradient-mesh overflow-hidden">
      <SignupForm />
    </div>
  )
}

export default function SignupPage() {
  return (
    <GuestOnlyRoute fallback={<AuthPageSkeleton />}>
      <Suspense fallback={<AuthPageSkeleton />}>
        <SignupPageContent />
      </Suspense>
    </GuestOnlyRoute>
  )
}
