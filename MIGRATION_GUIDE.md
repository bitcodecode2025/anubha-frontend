# Authentication Migration Guide

## 🎯 Quick Start

### For Development

1. **Install dependencies** (already done):

   ```bash
   npm install next-auth bcrypt @types/bcrypt
   ```

2. **Set up environment variables**:

   Create or update `.env.local`:

   ```env
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Generate NEXTAUTH_SECRET**:

   ```bash
   openssl rand -base64 32
   ```

4. **Run database migration** (already done):

   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Restart servers**:

   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

6. **Test the new auth**:
   - Visit `http://localhost:3000/login-new`
   - Try password login or Google login

---

## 🔄 What Changed

### ✅ New Features

1. **Password-based authentication**

   - Users can sign up with email + password
   - Users can login with email/phone + password
   - Passwords are securely hashed with bcrypt

2. **Google OAuth authentication**

   - One-click sign in with Google
   - Automatic user creation on first login
   - No password required for Google users

3. **Enhanced user model**

   - `email` field (required for new users)
   - `password` field (nullable, hashed)
   - `provider` field ("credentials" or "google")
   - `phone` now optional

4. **New pages**
   - `/login-new` - Modern login page with password + Google
   - `/signup-new` - Modern signup page with password + Google

### 🔒 Security Improvements

- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT-based sessions with NextAuth
- ✅ HttpOnly cookies (XSS protection)
- ✅ Generic error messages (no user enumeration)
- ✅ Zod validation on all inputs
- ✅ Password never exposed in responses

### 📦 What Stayed

- ✅ **All OTP code is kept intact** (not deleted)
- ✅ Old `/login` and `/register` pages still exist
- ✅ Old `AuthContext` still available
- ✅ All existing API endpoints work
- ✅ No breaking changes to existing users

---

## 🚀 Deployment Checklist

### Backend

- [ ] Add `password` and `provider` fields to User model ✅
- [ ] Run Prisma migration ✅
- [ ] Install bcrypt ✅
- [ ] Add password auth endpoints ✅
- [ ] Test signup/login endpoints
- [ ] Deploy backend

### Frontend

- [ ] Install next-auth ✅
- [ ] Create NextAuth API route ✅
- [ ] Add SessionProvider to Providers ✅
- [ ] Create login-new page ✅
- [ ] Create signup-new page ✅
- [ ] Set up environment variables
- [ ] Configure Google OAuth credentials
- [ ] Test authentication flows
- [ ] Deploy frontend

### Google OAuth Setup

- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://yourdomain.com/api/auth/callback/google`
- [ ] Copy Client ID and Secret to `.env.local`

---

## 🧪 Testing Guide

### Test Scenarios

#### 1. Password Signup (New User)

1. Go to `/signup-new`
2. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "9876543210" (optional)
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Sign Up"
4. Should auto-login and redirect to home page
5. Check database: User should have `provider: "credentials"` and hashed password

#### 2. Password Login (Existing User)

1. Go to `/login-new`
2. Enter email/phone + password
3. Click "Login"
4. Should redirect to home page
5. Check session: User data should be in NextAuth session

#### 3. Google Signup (New User)

1. Go to `/signup-new`
2. Click "Continue with Google"
3. Authorize with Google account
4. Should redirect to home page
5. Check database: User should have `provider: "google"`, `password: null`

#### 4. Google Login (Existing User)

1. Go to `/login-new`
2. Click "Continue with Google"
3. Should auto-login and redirect
4. Check session: User data should match database

#### 5. Error Handling

- Try signing up with existing email → Should show error
- Try logging in with wrong password → Should show error
- Try logging in with Google account using password → Should show error
- Try signing up without required fields → Should show validation errors

---

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL=your-postgres-url
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Frontend Environment Variables

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📊 Database Migration

### Migration Applied

```sql
-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "phone" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'credentials';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_provider_idx" ON "User"("provider");
```

### Rollback (if needed)

```sql
-- Remove new fields
ALTER TABLE "User"
  DROP COLUMN IF EXISTS "password",
  DROP COLUMN IF EXISTS "provider",
  ALTER COLUMN "phone" SET NOT NULL;

-- Drop index
DROP INDEX IF EXISTS "User_provider_idx";
```

---

## 🐛 Common Issues

### Issue: "NEXTAUTH_SECRET is not defined"

**Solution**: Add `NEXTAUTH_SECRET` to `.env.local` and restart Next.js server

### Issue: "Google sign-in failed"

**Solutions**:

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs in Google Cloud Console
- Make sure Google+ API is enabled
- Check browser console for errors

### Issue: "User already exists"

**Solution**: Email must be unique. User should login instead of signing up.

### Issue: "Invalid credentials"

**Solutions**:

- Check if user exists in database
- Verify password is correct
- Check if user signed up with Google (can't use password login)

### Issue: "Can't reach database server"

**Solution**: Backend database connection issue. Check `DATABASE_URL` and database status.

### Issue: Prisma generate EPERM error

**Solution**: Stop backend server, then run `npx prisma generate`

---

## 🔄 Migrating Existing Users

### Option 1: Keep OTP for existing users

- Old users continue using OTP login at `/login`
- New users use password/Google at `/login-new`
- Gradually migrate users to new system

### Option 2: Force password reset

1. Send email to all users
2. Ask them to set a password
3. Provide "Set Password" page
4. Update `provider` to "credentials"

### Option 3: Hybrid approach

- Allow both OTP and password login
- Show both options on login page
- Let users choose their preferred method

---

## 📝 API Documentation

### New Endpoints

#### `POST /api/auth/signup`

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "919876543210",
    "role": "USER"
  }
}
```

#### `POST /api/auth/login`

**Request**:

```json
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "919876543210",
    "role": "USER"
  }
}
```

#### `POST /api/auth/google`

**Request**:

```json
{
  "email": "john@gmail.com",
  "name": "John Doe",
  "googleId": "google-user-id"
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@gmail.com",
    "phone": null,
    "role": "USER"
  },
  "isNewUser": true
}
```

---

## ✅ Final Checklist

- [x] Database migration applied
- [x] Backend endpoints created
- [x] Frontend pages created
- [x] NextAuth configured
- [x] SessionProvider added
- [x] OTP code kept intact
- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] Tested password signup
- [ ] Tested password login
- [ ] Tested Google signup
- [ ] Tested Google login
- [ ] Tested error handling
- [ ] Ready for deployment

---

## 📞 Support

For questions or issues:

- Check `NEXTAUTH_SETUP.md` for detailed documentation
- Review error logs in browser console and server logs
- Test with curl/Postman to isolate frontend vs backend issues

---

**Status**: ✅ Implementation Complete - Ready for Testing
