import { z } from "zod"

// Load environment variables in development
if (process.env.NODE_ENV === "development") {
  try {
    require("dotenv").config()
  } catch (error) {
    // dotenv is optional, ignore if not installed
  }
}

const envSchema = z.object({
  // Firebase Client Config (Public)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Firebase API key is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase auth domain is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase project ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase storage bucket is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase messaging sender ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase app ID is required"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Firebase Admin (Server-only)
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1, "Firebase service account key is required"),

  // OAuth Credentials
  GOOGLE_CLIENT_ID: z.string().min(1, "Google client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google client secret is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GitHub client ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GitHub client secret is required"),

  // Database
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),

  // JWT Session
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url("App URL must be a valid URL").default("http://localhost:3000"),

  // Email Configuration
  EMAIL_HOST: z.string().optional().default("smtp.gmail.com"),
  EMAIL_PORT: z.string().optional().default("587"),
  EMAIL_USER: z.string().min(1, "Email user is required"),
  EMAIL_PASS: z.string().min(1, "Email password is required"),
  EMAIL_FROM_NAME: z.string().optional().default("Firebase Auth App"),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

function isBuildTime(): boolean {
  return process.env.NODE_ENV === "production" && !process.env.VERCEL && !process.env.RAILWAY_ENVIRONMENT
}

function getDefaultEnv(): Env {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "build-time-placeholder",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "build-time-placeholder",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "build-time-placeholder",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "build-time-placeholder",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "build-time-placeholder",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/firebase-auth-app",
    JWT_SECRET: process.env.JWT_SECRET || "development-jwt-secret-at-least-32-characters-long-for-build",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    EMAIL_PORT: process.env.EMAIL_PORT || "587",
    EMAIL_USER: process.env.EMAIL_USER || "build-time-placeholder",
    EMAIL_PASS: process.env.EMAIL_PASS || "build-time-placeholder",
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Firebase Auth App",
  } as Env
}

function validateEnv(): Env {
  // Return cached result if already validated
  if (cachedEnv) {
    return cachedEnv
  }

  if (isBuildTime()) {
    console.log("⚠️  Skipping environment validation during build time")
    cachedEnv = getDefaultEnv()
    return cachedEnv
  }

  try {
    cachedEnv = envSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n")

      if (process.env.NODE_ENV === "production") {
        throw new Error(`Environment validation failed:\n${missingVars}`)
      } else {
        console.warn(`⚠️  Environment validation failed:\n${missingVars}`)
        console.warn("Please copy .env.example to .env.local and fill in the required values")

        // Return defaults for development
        cachedEnv = getDefaultEnv()
        return cachedEnv
      }
    }
    throw error
  }
}

export function getEnv(): Env {
  return validateEnv()
}

export const env = new Proxy({} as Env, {
  get(target, prop) {
    const envVars = validateEnv()
    return envVars[prop as keyof Env]
  },
})
