# Firebase Auth App with MongoDB Backup

A modern Next.js authentication app featuring Firebase Auth with Google/GitHub OAuth, MongoDB backup, JWT session management, and a beautiful animated UI.

## Features

- 🔐 **Firebase Authentication** - Email/password, Google, and GitHub OAuth
- 🗄️ **MongoDB Backup** - User data backup and session management
- 🔑 **JWT Sessions** - Fallback authentication when Firebase is unavailable
- 🎨 **Modern UI** - Tailwind CSS with Framer Motion animations
- 🌙 **Dark/Light Mode** - Theme switching with next-themes
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🛡️ **Type Safe** - Full TypeScript with Zod validation

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Firebase Auth, JWT
- **Database**: MongoDB with Mongoose
- **Validation**: Zod, React Hook Form

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd firebase-auth-app
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

**Important**: The app includes development-friendly environment validation that:
- ✅ Allows the app to run with demo values in development
- ⚠️ Shows warnings for missing environment variables
- 🚫 Enforces all variables in production builds

If you see environment validation warnings, copy the provided `.env.local` file and update it with your actual credentials.

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication and add providers:
   - **Email/Password**: Authentication > Sign-in method > Email/Password
   - **Google**: Authentication > Sign-in method > Google
   - **GitHub**: Authentication > Sign-in method > GitHub
4. Get your config from Project Settings > General > Your apps
5. Generate service account key from Project Settings > Service accounts

### 4. OAuth Provider Setup

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials > Create OAuth 2.0 Client ID
3. Add authorized redirect URIs in Firebase Console

**GitHub OAuth:**
1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Add Client ID/Secret to Firebase Console

### 5. MongoDB Setup

Either use local MongoDB or MongoDB Atlas:

\`\`\`bash
# Local MongoDB
mongodb://localhost:27017/firebase-auth-app

# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/database
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables Reference

The app requires these environment variables:

**Firebase Client (Public)**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase Admin (Server-only)**
- `FIREBASE_SERVICE_ACCOUNT_KEY` - JSON service account key

**OAuth Providers**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`

**Database & Security**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - 32+ character secret for JWT signing

**App Configuration**
- `NEXT_PUBLIC_APP_URL` - Your app's URL (defaults to localhost:3000)

## Testing Fallback Scenario

To test the Firebase fallback functionality:

1. Sign in normally with Firebase
2. Temporarily break Firebase admin by changing `FIREBASE_SERVICE_ACCOUNT_KEY`
3. The app should still work using JWT sessions from MongoDB

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
├── .env.example          # Environment variables template
├── .env.local            # Your local environment variables
└── README.md             # This file
\`\`\`

## Security Features

- HttpOnly session cookies
- Hashed session tokens in database
- CORS and CSRF protection
- Input validation with Zod
- Secure JWT with short TTL

## Deployment

1. Set environment variables in your hosting platform
2. Ensure Firebase OAuth redirect URIs include production domain
3. Update `NEXT_PUBLIC_APP_URL` to production URL

\`\`\`bash
npm run build
npm start
\`\`\`

## Troubleshooting

**Environment Validation Errors:**
- Copy `.env.local` from the project and fill in your values
- Check that all required environment variables are set
- In development, the app will show warnings but continue running

**Firebase Connection Issues:**
- Verify your Firebase project settings
- Check that service account key is valid JSON
- Ensure OAuth providers are properly configured

**MongoDB Connection Issues:**
- Verify MongoDB is running (if using local)
- Check connection string format
- Ensure network access is allowed (if using Atlas)

## Firebase Documentation

This application heavily integrates with Firebase for authentication. For comprehensive Firebase integration details, see [FIREBASE_DOCUMENTATION.md](./FIREBASE_DOCUMENTATION.md).

## API Documentation

This application includes a comprehensive REST API for authentication and user management. For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Overview

**Authentication Endpoints:**
- `POST /api/auth/session` - Create server session after Firebase auth
- `POST /api/auth/refresh-session` - Refresh existing session
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/user/me` - Get current user information

**Key Features:**
- 🔐 **Hybrid Authentication** - Firebase + MongoDB backup
- 🍪 **HTTP-only Cookies** - Secure session management
- 🔑 **JWT Tokens** - Server-side session validation
- 🗄️ **MongoDB Integration** - User data persistence
- 🛡️ **Security First** - Bcrypt hashing, CSRF protection

### Authentication Flow

1. **User signs in** with Firebase (email, Google, or GitHub)
2. **Frontend gets** Firebase ID token
3. **POST /api/auth/session** creates server-side JWT session
4. **MongoDB stores** user data and hashed session
5. **HTTP-only cookie** set for subsequent requests
6. **GET /api/user/me** validates session and returns user data

### Database Schema

```typescript
interface User {
  uid: string                    // Firebase UID
  email: string                  // User email
  name?: string                  // Display name
  provider: "email" | "google" | "github"
  photoURL?: string              // Profile picture
  sessions: SessionRecord[]      // Active sessions
  lastSeen: Date                // Last activity
}

interface SessionRecord {
  tokenHash: string             // Bcrypt hashed JWT
  issuedAt: Date               // Creation time
  expiresAt: Date              // Expiration time
  userAgent?: string           // Browser info
  ip?: string                  // Client IP
}
```

## Manual Testing Checklist

- [ ] Email signup and login
- [ ] Password reset email
- [ ] Google OAuth sign-in
- [ ] GitHub OAuth sign-in
- [ ] Protected `/about-me` page access
- [ ] Session fallback when Firebase is down
- [ ] Logout functionality
- [ ] Dark/light mode toggle
- [ ] Mobile responsiveness
- [ ] API endpoint testing
- [ ] Session management
- [ ] Database user creation
