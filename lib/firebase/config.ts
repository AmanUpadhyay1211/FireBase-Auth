import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { env } from "@/lib/env"

function getFirebaseConfig() {
  try {
    const config: any = {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    
    // Add measurement ID if available (for Google Analytics)
    if (env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
      config.measurementId = env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    }
    
    return config
  } catch (error) {
    console.error("Firebase configuration error:", error)
    // Return demo config for development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using demo Firebase config for development")
      return {
        apiKey: "demo-api-key",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project",
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456",
        measurementId: "G-DEMO123456",
      }
    }
    throw error
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Auth
export const auth = getAuth(app)

// Connect to Auth emulator in development if needed
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Uncomment to use Firebase Auth emulator
  // connectAuthEmulator(auth, "http://localhost:9099")
}

export default app
