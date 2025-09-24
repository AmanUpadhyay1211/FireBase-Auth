import { connectToDatabase } from "../connection"
import User, { type UserDocument } from "../models/user"

export class UserService {
  private static async ensureConnection() {
    await connectToDatabase()
  }

  static async findByUid(uid: string): Promise<UserDocument | null> {
    await this.ensureConnection()
    return User.findOne({ uid })
  }

  static async findByEmail(email: string): Promise<UserDocument | null> {
    await this.ensureConnection()
    return User.findOne({ email: email.toLowerCase() })
  }

  static async upsertUser(userData: {
    uid: string
    email: string
    name?: string | null
    provider: "email" | "google" | "github"
    photoURL?: string | null
  }): Promise<UserDocument> {
    await this.ensureConnection()

    const user = await User.findOneAndUpdate(
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

    if (!user) {
      throw new Error("Failed to upsert user")
    }

    return user
  }

  static async addUserSession(
    uid: string,
    tokenHash: string,
    expiresAt: Date,
    userAgent?: string,
    ip?: string,
  ): Promise<void> {
    await this.ensureConnection()

    const user = await User.findOne({ uid })
    if (!user) {
      throw new Error("User not found")
    }

    await user.addSession(tokenHash, expiresAt, userAgent, ip)
  }

  static async removeUserSession(uid: string, tokenHash: string): Promise<void> {
    await this.ensureConnection()

    const user = await User.findOne({ uid })
    if (!user) {
      throw new Error("User not found")
    }

    await user.removeSession(tokenHash)
  }

  static async validateUserSession(uid: string, tokenHash: string): Promise<boolean> {
    await this.ensureConnection()

    const user = await User.findOne({ uid })
    if (!user) {
      return false
    }

    return user.validateSession(tokenHash)
  }

  static async cleanExpiredSessions(uid: string): Promise<void> {
    await this.ensureConnection()

    const user = await User.findOne({ uid })
    if (user) {
      await user.cleanExpiredSessions()
      await user.save()
    }
  }

  static async getUserStats(): Promise<{
    totalUsers: number
    activeUsers: number
    usersByProvider: Record<string, number>
  }> {
    await this.ensureConnection()

    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })

    const providerStats = await User.aggregate([{ $group: { _id: "$provider", count: { $sum: 1 } } }])

    const usersByProvider = providerStats.reduce(
      (acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalUsers,
      activeUsers,
      usersByProvider,
    }
  }
}
