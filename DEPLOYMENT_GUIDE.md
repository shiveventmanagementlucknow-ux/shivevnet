# 🚀 Quick Deployment Guide - Registration Fix

## ✅ What Was Fixed

1. **Frontend baseURL** - Now includes `/api` prefix
2. **Backend Root Route** - Added test endpoint `/`
3. Everything else was already correct ✅

## 📝 Required Actions

### Step 1: Update Render Backend Environment Variables
1. Go to Render Dashboard → Your Backend Service
2. Click "Environment"
3. Make sure these are set:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://shiveventlucknow.in` (updated for production)
   - All other variables from `.env.production.example`

### Step 2: Push Backend Code
```bash
cd backend
git add .
git commit -m "Fix: Add root route for API health check"
git push origin main
```
Render will auto-deploy in ~2 minutes

### Step 3: Push Frontend Code
```bash
cd frontend
git add .
git commit -m "Fix: Correct API baseURL to include /api prefix"
git push origin main
```
Vercel will auto-deploy in ~1 minute

### Step 4: Test the Fix
1. Open https://shiveventlucknow.in
2. Click "Sign Up"
3. Fill in form (name, email, password, phone, city)
4. Click "Sign Up"
5. Should see success message ✅

## 🔍 Troubleshooting

### If you see 404 errors:
```bash
# Check if backend is running:
curl https://api.shiveventlucknow.in/
# Should return: { "success": true, "message": "✅ Shiv Event Management API is Running" }
```

### If you see 405 errors:
- Check that request is POST (not GET)
- Check URL is: `https://api.shiveventlucknow.in/api/users/register`

### If you see CORS errors:
- Check backend CORS_ORIGINS includes frontend domain
- Or set CORS_ORIGINS=https://shiveventlucknow.in in Render env vars

### If registration still fails:
- Open Browser DevTools (F12)
- Go to Network tab
- Try signup again
- Look at the failed request → Response
- Check what error message backend returns

## 📞 API Endpoints

### Public Endpoints (No Auth Required)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/services` - Get all services
- `GET /api/blogs` - Get all blogs
- `GET /api/gallery` - Get all gallery images
- `GET /api/testimonials` - Get all testimonials
- `POST /api/contact` - Submit contact form

### Protected Endpoints (Require Auth Token)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `PATCH /api/users/change-password` - Change password
- `GET /api/bookings/my` - Get my bookings

## 📋 Files Changed

```
backend/
├── server.js ...................... ✅ Added root GET / route

frontend/
├── src/services/api.js ........... ✅ Fixed baseURL to include /api
├── .env (unchanged, already correct)
└── src/context/UserAuthContext.jsx (unchanged, already correct)

Documentation/
├── API_FIX_SUMMARY.md ............ 📚 Complete fix documentation
└── .env.production.example ....... 📚 Production env template
```

## ✨ After Deployment

Once both frontend and backend are deployed:
1. ✅ Signup should work without errors
2. ✅ User registration sends to correct endpoint
3. ✅ Backend returns user token
4. ✅ Frontend stores token in localStorage
5. ✅ User is logged in

## 🔐 Security Notes

- `JWT_SECRET` - Keep this secure, don't share
- `CLOUDINARY_API_SECRET` - Keep this secure
- `RESEND_API_KEY` - Keep this secure
- Never commit .env files to git (use .gitignore)

## 📞 Common Questions

**Q: Why was the URL not working?**
A: The baseURL was missing the `/api` prefix, so requests went to `/users/register` instead of `/api/users/register`

**Q: Do I need to restart Render?**
A: No, pushing code triggers automatic deployment

**Q: Do I need to restart Vercel?**
A: No, pushing code triggers automatic deployment

**Q: How long does deployment take?**
A: Backend (Render): 2-5 minutes | Frontend (Vercel): 1-3 minutes

**Q: What if frontend deployment fails?**
A: Check Vercel Deployments tab for error logs. Most common: missing dependencies

**Q: What if backend deployment fails?**
A: Check Render Logs tab for error logs. Most common: missing env variables

---

**Status**: Ready to Deploy 🎉
Push both repos and test the signup flow!
