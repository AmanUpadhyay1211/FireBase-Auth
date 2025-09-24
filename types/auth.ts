export interface User {
  _id?: string
  uid: string
  email: string
  name: string | null
  provider: "email" | "google" | "github"
  photoURL: string | null
  createdAt: Date
  lastSeen: Date
  sessions: SessionRecord[]
}

export interface SessionRecord {
  tokenHash: string
  issuedAt: Date
  expiresAt: Date
  userAgent?: string
  ip?: string
}

export interface JWTPayload {
  uid: string
  email: string
  name?: string | null
  provider?: string
  photoURL?: string | null
  sessionId: string
  iat: number
  exp: number
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}
