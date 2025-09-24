import mongoose, { Schema, type Document, type Model } from "mongoose"
import bcrypt from "bcryptjs"
import type { User as UserType, SessionRecord } from "@/types/auth"

// Session subdocument schema
const sessionSchema = new Schema<SessionRecord>({
  tokenHash: { type: String, required: true },
  issuedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  userAgent: { type: String },
  ip: { type: String },
})

// User document interface
export interface UserDocument extends UserType, Document {
  addSession(tokenHash: string, expiresAt: Date, userAgent?: string, ip?: string): Promise<void>
  removeSession(tokenHash: string): Promise<void>
  cleanExpiredSessions(): Promise<void>
  validateSession(tokenHash: string): boolean
}

// User schema
const userSchema = new Schema<UserDocument>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: { type: String, default: null },
    provider: {
      type: String,
      enum: ["email", "google", "github"],
      required: true,
    },
    photoURL: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    sessions: [sessionSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

// Indexes for performance (uid and email already have unique indexes from field definitions)
userSchema.index({ "sessions.tokenHash": 1 })
userSchema.index({ "sessions.expiresAt": 1 })

// Instance methods
userSchema.methods.addSession = async function (
  tokenHash: string,
  expiresAt: Date,
  userAgent?: string,
  ip?: string,
): Promise<void> {
  // Hash the token before storing
  const hashedToken = await bcrypt.hash(tokenHash, 10)

  this.sessions.push({
    tokenHash: hashedToken,
    issuedAt: new Date(),
    expiresAt,
    userAgent,
    ip,
  })

  // Clean expired sessions while we're at it
  await this.cleanExpiredSessions()

  // Update last seen
  this.lastSeen = new Date()

  await this.save()
}

userSchema.methods.removeSession = async function (tokenHash: string): Promise<void> {
  // Find and remove session by comparing hashed tokens
  this.sessions = this.sessions.filter((session: SessionRecord) => {
    return !bcrypt.compareSync(tokenHash, session.tokenHash)
  })

  await this.save()
}

userSchema.methods.cleanExpiredSessions = async function (): Promise<void> {
  const now = new Date()
  this.sessions = this.sessions.filter((session: SessionRecord) => session.expiresAt > now)
}

userSchema.methods.validateSession = function (tokenHash: string): boolean {
  const now = new Date()

  return this.sessions.some((session: SessionRecord) => {
    return session.expiresAt > now && bcrypt.compareSync(tokenHash, session.tokenHash)
  })
}

// Static methods
userSchema.statics.findByUid = function (uid: string) {
  return this.findOne({ uid })
}

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

userSchema.statics.upsertUser = async function (userData: {
  uid: string
  email: string
  name?: string | null
  provider: "email" | "google" | "github"
  photoURL?: string | null
}) {
  const user = await this.findOneAndUpdate(
    { uid: userData.uid },
    {
      ...userData,
      email: userData.email.toLowerCase(),
      lastSeen: new Date(),
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  )

  return user
}

// Pre-save middleware
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase()
  }
  next()
})

// Create and export model
const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema)

export default User
