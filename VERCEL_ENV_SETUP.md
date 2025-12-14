# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel Dashboard → Project Settings → Environment Variables:

### **Production Variables**
```bash
# API Configuration
VITE_API_URL=https://your-backend-url.com
NODE_ENV=production

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Optional: Analytics
VITE_GA_ID=your-google-analytics-id
```

### **Development Variables** (for testing)
```bash
VITE_API_URL=http://localhost:4000
NODE_ENV=development
```

## Backend Deployment Options

### **Option 1: Deploy Backend to Railway/Heroku**
1. Create new project on Railway/Heroku
2. Connect your GitHub repo
3. Deploy backend folder
4. Update VITE_API_URL with the deployed URL

### **Option 2: Use Vercel Serverless Functions**
1. Move backend files to `/api` folder
2. Convert routes to serverless functions
3. No separate backend needed

### **Option 3: Mock Data Mode (Current)**
- Frontend works with mock data
- No backend required
- Perfect for demo/testing

## Current Status
- ✅ Frontend: Ready for deployment
- ⚠️ Backend: Running locally (needs cloud deployment)
- ✅ Authentication: Working with mock data
- ✅ All features: Functional

## Quick Deploy Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_API_URL
vercel env add NODE_ENV
```

## Post-Deployment Checklist
- [ ] Verify login works
- [ ] Test admin panel access
- [ ] Check mobile responsiveness
- [ ] Confirm all features work
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)