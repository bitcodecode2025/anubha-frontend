# ⚠️ SETUP REQUIRED BEFORE TESTING

## 🔴 Critical: Environment Variables Missing

You **MUST** set up environment variables before the new authentication will work!

---

## 📝 Quick Setup (2 Minutes)

### Step 1: Generate Secret Key

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output (it will look like: `dGVzdC1zZWNyZXQta2V5LWZvci1kZXZlbG9wbWVudAo=`)

### Step 2: Create `.env.local` File

Create a new file: `anubha-frontend/.env.local`

Paste this content:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=PASTE_YOUR_SECRET_HERE

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Replace** `PASTE_YOUR_SECRET_HERE` with the secret you generated in Step 1.

### Step 3: Restart Frontend Server

```bash
# Stop the frontend server (Ctrl+C)
# Then restart it:
cd anubha-frontend
npm run dev
```

---

## ✅ What You'll See After Setup

### New Login Page (`/login`)

- ✅ Email or Phone + Password input
- ✅ "Forgot password?" link
- ✅ Google sign-in button
- ✅ Beautiful modern UI with animations

### New Register Page (`/register`)

- ✅ Name, Email, Phone (optional), Password fields
- ✅ Password confirmation
- ✅ Google sign-up button
- ✅ Auto-login after signup

---

## 🔧 Optional: Google OAuth Setup

If you want Google login to work:

1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

**Note**: Password login will work WITHOUT Google OAuth setup.

---

## 🐛 Troubleshooting

### "NEXTAUTH_SECRET is not defined" Error

**Problem**: Environment variables not loaded

**Solution**:

1. Make sure `.env.local` file exists in `anubha-frontend/` folder
2. Make sure `NEXTAUTH_SECRET` is set
3. Restart Next.js server

### Still See Old OTP Login Page

**Problem**: Browser cache or server not restarted

**Solution**:

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart frontend server
3. Clear browser cache

### Changes Not Visible

**Problem**: Frontend server needs restart

**Solution**:

```bash
# Stop frontend (Ctrl+C)
cd anubha-frontend
npm run dev
```

---

## 📚 Full Documentation

For complete setup instructions, see:

- `TODO_BEFORE_TESTING.md` - Complete checklist
- `QUICK_START.md` - Fast setup guide
- `NEXTAUTH_SETUP.md` - Detailed documentation

---

## ✅ Success Checklist

- [ ] Generated NEXTAUTH_SECRET
- [ ] Created `.env.local` file
- [ ] Added NEXTAUTH_SECRET to `.env.local`
- [ ] Added NEXTAUTH_URL to `.env.local`
- [ ] Added NEXT_PUBLIC_API_URL to `.env.local`
- [ ] Restarted frontend server
- [ ] Visited `/login` - See new UI
- [ ] Visited `/register` - See new UI

---

**Current Status**: ⚠️ Environment variables required  
**Next Step**: Follow Step 1 above  
**Time Required**: 2 minutes
