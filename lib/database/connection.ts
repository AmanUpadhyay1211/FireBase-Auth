import mongoose from "mongoose"
import { env } from "@/lib/env"

interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global connection cache to prevent multiple connections in serverless environments
declare global {
  var myMongoose: MongooseConnection | undefined
}

const cached: MongooseConnection = globalThis.myMongoose || {
  conn: null,
  promise: null,
}

if (!globalThis.myMongoose) {
  globalThis.myMongoose = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    cached.promise = mongoose.connect(env.MONGODB_URI, options)
  }

  try {
    cached.conn = await cached.promise
    console.log("Connected to MongoDB")
    return cached.conn
  } catch (error) {
    cached.promise = null
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (cached.conn) {
    await cached.conn.connection.close()
    console.log("MongoDB connection closed through app termination")
    process.exit(0)
  }
})
