# 🧪 API Testing Guide

This guide provides practical examples for testing all API endpoints in the Firebase Auth App.

## 🚀 Quick Start

### Prerequisites
- Running development server (`npm run dev`)
- Valid Firebase authentication setup
- MongoDB connection established

## 📋 API Endpoints Testing

### 1. POST /api/auth/session

**Purpose**: Create server-side session after Firebase authentication

**Test with cURL**:
```bash
# First, get a Firebase ID token from your frontend
# Then test the session creation
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your_firebase_id_token_here"}'
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "google",
    "photoURL": "https://..."
  }
}
```

**What to verify**:
- ✅ User data is returned correctly
- ✅ HTTP-only cookie `app_session` is set
- ✅ User is created/updated in MongoDB
- ✅ Session is stored in database

---

### 2. GET /api/user/me

**Purpose**: Get current user information from session

**Test with cURL**:
```bash
# Test with session cookie (from previous request)
curl -X GET http://localhost:3000/api/user/me \
  -H "Cookie: app_session=your_jwt_token_here"
```

**Alternative with Authorization header**:
```bash
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer your_firebase_id_token_here"
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "google",
    "photoURL": "https://...",
    "lastSeen": "2024-01-01T00:00:00.000Z"
  },
  "source": "database"
}
```

**What to verify**:
- ✅ User data matches session
- ✅ `lastSeen` is updated
- ✅ `source` indicates data origin
- ✅ Works with both cookie and header auth

---

### 3. POST /api/auth/refresh-session

**Purpose**: Refresh existing session with new Firebase token

**Test with cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/refresh-session \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session=old_jwt_token_here" \
  -d '{"idToken": "new_firebase_id_token_here"}'
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "google",
    "photoURL": "https://..."
  }
}
```

**What to verify**:
- ✅ Old session is removed from database
- ✅ New session is created
- ✅ New cookie is set
- ✅ User data is updated

---

### 4. POST /api/auth/logout

**Purpose**: Logout user and clear server-side session

**Test with cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: app_session=your_jwt_token_here"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**What to verify**:
- ✅ Session is removed from database
- ✅ Cookie is cleared (maxAge: 0)
- ✅ User can no longer access protected routes

---

## 🔍 Frontend Integration Testing

### Test Authentication Flow

1. **Sign in through UI**:
   ```typescript
   // This should trigger POST /api/auth/session
   const { user } = await signInWithEmail(email, password)
   ```

2. **Check user data**:
   ```typescript
   // This should call GET /api/user/me
   const { user, loading } = useAuth()
   ```

3. **Test logout**:
   ```typescript
   // This should call POST /api/auth/logout
   await signOut()
   ```

### Test Protected Routes

1. **Access `/about-me` without auth** → Should redirect to `/auth/login`
2. **Access `/about-me` with valid session** → Should show user data
3. **Access `/` with valid session** → Should redirect to `/about-me`

---

## 🗄️ Database Testing

### Check MongoDB Collections

```javascript
// Connect to MongoDB and check user collection
db.users.find().pretty()

// Check specific user
db.users.findOne({ uid: "firebase_uid" })

// Check sessions array
db.users.findOne({ uid: "firebase_uid" }, { sessions: 1 })
```

### Verify Session Storage

```javascript
// Check if session is properly hashed
db.users.findOne(
  { uid: "firebase_uid" },
  { sessions: { $elemMatch: { issuedAt: { $gte: new Date(Date.now() - 60000) } } } }
)
```

---

## 🛡️ Security Testing

### Test Invalid Tokens

```bash
# Test with invalid JWT
curl -X GET http://localhost:3000/api/user/me \
  -H "Cookie: app_session=invalid_token"

# Expected: 401 Unauthorized
```

### Test Expired Sessions

```bash
# Test with expired token
curl -X GET http://localhost:3000/api/user/me \
  -H "Cookie: app_session=expired_jwt_token"

# Expected: 401 Unauthorized
```

### Test Missing Authentication

```bash
# Test without any auth
curl -X GET http://localhost:3000/api/user/me

# Expected: 401 Unauthorized
```

---

## 🐛 Error Scenarios Testing

### Test Firebase Unavailable

1. **Break Firebase admin config** (temporarily)
2. **Try to create session** → Should fall back to existing session
3. **Verify fallback works** → User should still be authenticated

### Test Database Unavailable

1. **Stop MongoDB** (temporarily)
2. **Try to access protected route** → Should handle gracefully
3. **Check error responses** → Should return proper error codes

### Test Invalid Input

```bash
# Test with missing idToken
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request with validation errors
```

---

## 📊 Performance Testing

### Test Session Validation Speed

```bash
# Time the response
time curl -X GET http://localhost:3000/api/user/me \
  -H "Cookie: app_session=valid_token"
```

### Test Concurrent Requests

```bash
# Test multiple simultaneous requests
for i in {1..10}; do
  curl -X GET http://localhost:3000/api/user/me \
    -H "Cookie: app_session=valid_token" &
done
wait
```

---

## 🔧 Debugging Tips

### Enable Debug Logging

```typescript
// Add to your environment
DEBUG=true
```

### Check Network Tab

1. **Open browser DevTools**
2. **Go to Network tab**
3. **Perform authentication actions**
4. **Verify API calls and responses**

### Check Console Logs

```typescript
// Look for these log messages
console.log("Session creation error:", error)
console.log("Firebase ID token verification failed:", error)
console.log("Failed to create server session:", error)
```

---

## ✅ Testing Checklist

- [ ] **Session Creation**: POST /api/auth/session works
- [ ] **User Retrieval**: GET /api/user/me returns correct data
- [ ] **Session Refresh**: POST /api/auth/refresh-session updates session
- [ ] **Logout**: POST /api/auth/logout clears session
- [ ] **Database Integration**: User data persists in MongoDB
- [ ] **Security**: Invalid tokens are rejected
- [ ] **Error Handling**: Proper error responses
- [ ] **Frontend Integration**: UI works with API
- [ ] **Protected Routes**: Authentication-based routing
- [ ] **Fallback Scenarios**: Works when Firebase is down

---

## 🚨 Common Issues

### "Invalid ID token" Error
- **Cause**: Firebase token expired or invalid
- **Solution**: Refresh token or re-authenticate

### "User not found" Error
- **Cause**: User not in MongoDB database
- **Solution**: Check user creation in session endpoint

### "Session expired" Error
- **Cause**: JWT token expired
- **Solution**: Refresh session or re-authenticate

### Database Connection Issues
- **Cause**: MongoDB not running or wrong URI
- **Solution**: Check MongoDB connection and URI

---

This testing guide ensures your API endpoints work correctly and provides a solid foundation for debugging any issues that may arise.
