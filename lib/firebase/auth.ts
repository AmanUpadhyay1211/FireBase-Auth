import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth"
import { auth } from "./config"

// OAuth Providers
const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

// Add additional scopes if needed
googleProvider.addScope("profile")
googleProvider.addScope("email")
githubProvider.addScope("user:email")

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  provider: string
}

export function formatAuthUser(user: User, provider = "email"): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider,
  }
}

// Email/Password Authentication
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

// OAuth Authentication
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithGithub(): Promise<UserCredential> {
  return signInWithPopup(auth, githubProvider)
}

// Password Reset
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email)
}

// Sign Out
export async function signOutUser(): Promise<void> {
  return signOut(auth)
}

// Auth State Observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Get ID Token
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null

  try {
    return await user.getIdToken()
  } catch (error) {
    console.error("Failed to get ID token:", error)
    return null
  }
}

// Create Session (call API to create server session)
export async function createSession(idToken: string) {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      throw new Error(`Session creation failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to create session:", error)
    throw error
  }
}

// Logout (clear both Firebase and server session)
export async function logout() {
  try {
    // Clear server session first
    await fetch("/api/auth/logout", { method: "POST" })

    // Then sign out from Firebase
    await signOutUser()
  } catch (error) {
    console.error("Logout failed:", error)
    // Still try to sign out from Firebase even if server logout fails
    await signOutUser()
  }
}
