# NextAuth Setup Guide

## Overview

This application now supports **two authentication methods**:

1. **Password-based authentication** (Email/Phone + Password)
2. **Google OAuth authentication**

The old OTP-based authentication code has been **kept intact but is not actively used** in the new flow.

---

## Environment Variables

Add the following to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret** to `.env.local`

---

## File Structure

### Backend (Express + Prisma)

```
src/
├── modules/
│   └── auth/
│       ├── auth.controller.ts    # Password & Google auth endpoints
│       ├── auth.service.ts       # Business logic
│       ├── auth.routes.ts        # API routes
│       └── auth.schema.ts        # Zod validation schemas
└── prisma/
    └── schema.prisma             # User model with password & provider fields
```

### Frontend (Next.js + NextAuth)

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          # NextAuth configuration
├── context/
│   ├── AuthContext.tsx           # Old OTP-based context (kept for compatibility)
│   └── AuthContextNew.tsx        # New NextAuth-based context
├── login-new/
│   └── page.tsx                  # New login page (password + Google)
├── signup-new/
│   └── page.tsx                  # New signup page (password + Google)
├── login/
│   └── page.tsx                  # Old OTP login (kept but not linked)
└── register/
    └── page.tsx                  # Old OTP register (kept but not linked)
```

---

## API Endpoints

### Backend Routes

#### Password-Based Auth (Active)

- `POST /api/auth/signup` - Create account with email/phone + password
- `POST /api/auth/login` - Login with email/phone + password

#### Google Auth (Active)

- `POST /api/auth/google` - Authenticate with Google (called by NextAuth)

#### OTP-Based Auth (Inactive but kept)

- `POST /api/auth/register/send-otp`
- `POST /api/auth/register/verify-otp`
- `POST /api/auth/login/send-otp`
- `POST /api/auth/login/verify-otp`

#### Session Management

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Refresh session

---

## Database Schema

### User Model

```prisma
model User {
  id            String           @id @default(uuid())
  name          String
  role          Role             @default(USER)
  email         String?          @unique
  phone         String?          @unique
  password      String?          // Password hash - nullable for Google auth
  provider      String           @default("credentials") // "credentials" or "google"
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  // ... other fields
}
```

### Key Points

- `password` is **nullable** (Google users don't have passwords)
- `provider` indicates auth method: `"credentials"` or `"google"`
- `email` is **required** for new signups
- `phone` is **optional** for new signups

---

## User Flows

### 1. Password Signup

1. User visits `/signup-new`
2. Fills in: Name, Email, Phone (optional), Password, Confirm Password
3. Frontend calls `POST /api/auth/signup`
4. Backend hashes password and creates user
5. Frontend auto-logs in user with NextAuth
6. User redirected to home page

### 2. Password Login

1. User visits `/login-new`
2. Enters Email/Phone + Password
3. Frontend calls NextAuth `signIn("credentials", ...)`
4. NextAuth calls backend `POST /api/auth/login`
5. Backend validates credentials and returns user data
6. NextAuth creates session
7. User redirected to home page

### 3. Google Login/Signup

1. User clicks "Continue with Google" on `/login-new` or `/signup-new`
2. NextAuth redirects to Google OAuth
3. User authorizes the app
4. Google redirects back with user data
5. NextAuth calls backend `POST /api/auth/google`
6. Backend checks if user exists:
   - **Exists**: Return existing user
   - **New**: Create user with `provider: "google"`, `password: null`
7. NextAuth creates session
8. User redirected to home page

### 4. Logout

1. User clicks logout
2. Frontend calls `signOut()` from NextAuth
3. Frontend calls backend `POST /api/auth/logout`
4. Session cleared
5. User redirected to home page

---

## Security Features

### Backend

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Generic error messages (no user enumeration)
- ✅ Zod validation for all inputs
- ✅ Email uniqueness check
- ✅ Phone uniqueness check (optional field)
- ✅ Separate providers (credentials vs Google)
- ✅ No password exposure in API responses

### Frontend

- ✅ JWT-based sessions (NextAuth)
- ✅ HttpOnly cookies (secure)
- ✅ Client-side validation
- ✅ Password visibility toggle
- ✅ Password confirmation check
- ✅ Loading states for all actions
- ✅ Error handling with toast notifications

---

## Migration Notes

### What Changed

1. **Database**: Added `password` and `provider` fields to `User` model
2. **Backend**: Added password-based auth endpoints
3. **Frontend**: Created new login/signup pages with NextAuth
4. **Session**: Now using NextAuth JWT sessions instead of custom tokens

### What Stayed the Same

1. **OTP Code**: All OTP-related code is **kept intact**
2. **Old Pages**: `/login` and `/register` still exist (not linked in UI)
3. **AuthContext**: Old context kept for backward compatibility
4. **API Structure**: Existing endpoints unchanged

### Breaking Changes

- ⚠️ `phone` is now **optional** (was required before)
- ⚠️ Users must have either `email` (new) or `phone` (old)
- ⚠️ New users created via password/Google will have `email` set

---

## Testing

### Test Password Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Test Password Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

### Test Google Auth

1. Visit `http://localhost:3000/login-new`
2. Click "Continue with Google"
3. Authorize with your Google account
4. Check database for new user with `provider: "google"`

---

## Troubleshooting

### "NEXTAUTH_SECRET is not defined"

- Make sure `.env.local` has `NEXTAUTH_SECRET` set
- Restart the Next.js dev server

### "Google sign-in failed"

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs in Google Cloud Console
- Make sure Google+ API is enabled

### "User already exists"

- Email must be unique
- Phone must be unique (if provided)
- Check database for existing records

### "Invalid credentials"

- Check if user exists in database
- Verify password is correct
- Check if user signed up with Google (can't login with password)

---

## Next Steps

1. ✅ Add "Forgot Password" functionality
2. ✅ Add email verification
3. ✅ Add rate limiting for auth endpoints
4. ✅ Add 2FA (optional)
5. ✅ Migrate existing OTP users to password-based auth

---

## Support

For issues or questions, contact the development team.
