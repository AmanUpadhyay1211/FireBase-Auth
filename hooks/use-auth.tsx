"use client"

import { useState, useEffect, useContext, createContext, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  onAuthStateChange,
  formatAuthUser,
  getIdToken,
  createSession,
  logout,
  type AuthUser,
} from "@/lib/firebase/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Get provider info from user metadata
        const provider = firebaseUser.providerData[0]?.providerId || "email"
        const authUser = formatAuthUser(firebaseUser, provider)
        setUser(authUser)

        // Create server session
        try {
          const idToken = await getIdToken()
          if (idToken) {
            await createSession(idToken)
          }
        } catch (error) {
          console.error("Failed to create server session:", error)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
