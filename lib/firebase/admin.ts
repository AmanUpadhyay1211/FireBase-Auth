import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { env } from "@/lib/env"

let adminApp: App

function getAdminApp(): App {
  if (adminApp) return adminApp

  try {
    // Parse the service account key from environment
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY)

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    } else {
      adminApp = getApps()[0]
    }

    return adminApp
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error)

    if (process.env.NODE_ENV === "development") {
      console.warn("Firebase Admin not configured properly for development")
      console.warn("Some server-side auth features may not work")
      console.warn("Please configure FIREBASE_SERVICE_ACCOUNT_KEY in .env.local")
    }

    throw new Error("Firebase Admin initialization failed")
  }
}

export const adminAuth = getAuth(getAdminApp())

export function getAdminAuth() {
  return adminAuth
}

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return { success: true, decodedToken }
  } catch (error) {
    console.error("Firebase ID token verification failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateUserPassword(uid: string, newPassword: string) {
  try {
    await adminAuth.updateUser(uid, {
      password: newPassword
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to update user password:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update password" 
    }
  }
}
