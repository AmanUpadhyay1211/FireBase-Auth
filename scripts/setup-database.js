// Database setup and seeding script
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firebase-auth-app"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db()

    // Create users collection with indexes
    const usersCollection = db.collection("users")

    // Create indexes for better performance
    await usersCollection.createIndex({ uid: 1 }, { unique: true })
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ "sessions.tokenHash": 1 })
    await usersCollection.createIndex({ "sessions.expiresAt": 1 })
    await usersCollection.createIndex({ lastSeen: 1 })
    await usersCollection.createIndex({ provider: 1 })

    console.log("Database indexes created successfully")

    // Optional: Create a test user (remove in production)
    const testUser = {
      uid: "test-user-123",
      email: "test@example.com",
      name: "Test User",
      provider: "email",
      photoURL: null,
      createdAt: new Date(),
      lastSeen: new Date(),
      sessions: [],
    }

    await usersCollection.updateOne({ uid: testUser.uid }, { $setOnInsert: testUser }, { upsert: true })

    console.log("Test user created (if not exists)")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("Database setup completed")
  }
}

setupDatabase()
