import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <LoginForm />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
