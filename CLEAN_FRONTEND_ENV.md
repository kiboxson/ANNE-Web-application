# 🧹 Clean Up Frontend Environment Variables

## Current Problem
Your `Frontend/.env` contains backend secrets that should NOT be in frontend:

❌ **Remove these from Frontend/.env:**
```
CLOUDINARY_URL=cloudinary://...
MONGODB_URI=mongodb+srv://...
CLOUDINARY_API_SECRET=...
CLOUDINARY_API_KEY=...
EMAIL_USER=...
EMAIL_PASS=...
PAYHERE_MERCHANT_ID=...
PAYHERE_SECRET=...
```

## ✅ Frontend/.env should ONLY contain:
```
# Backend API URL (update after backend deployment)
REACT_APP_API_URL=https://your-backend-url.vercel.app

# Cloudinary for frontend uploads (public info only)
REACT_APP_CLOUDINARY_CLOUD_NAME=dgpocgkx3
REACT_APP_CLOUDINARY_UPLOAD_PRESET=products

# Environment
REACT_APP_ENVIRONMENT=production
```

## 🔒 Security Issue
Backend secrets in frontend are:
- Publicly accessible in browser
- Visible in source code
- Major security vulnerability

Keep all secrets in Backend/.env only!
