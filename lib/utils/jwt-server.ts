import jwt from "jsonwebtoken"
import { env } from "@/lib/env"
import type { JWTPayload } from "@/types/auth"

const JWT_SECRET = env.JWT_SECRET
const JWT_EXPIRES_IN = "7d" // 7 days

export function signJWT(
  payload: Omit<JWTPayload, "iat" | "exp"> & {
    name?: string | null
    provider?: string
    photoURL?: string | null
  },
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "firebase-auth-app",
    audience: "firebase-auth-app-users",
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "firebase-auth-app",
      audience: "firebase-auth-app-users",
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export function getJWTExpiration(): Date {
  // Calculate expiration date (7 days from now)
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT decode failed:", error)
    return null
  }
}
