# ANNE Web Application - Deployment Setup Guide

## Problem Fixed ✅

Your frontend and backend were not connecting because the frontend was hardcoded to use `http://localhost:5000`. When both applications are deployed on Vercel, they have different URLs and need to communicate using the production URLs.

## Solution Implemented

### 1. Created Centralized API Configuration
- **File**: `Frontend/src/config/api.js`
- **Purpose**: Centralizes all API endpoints and handles environment-based URL switching
- **Features**: 
  - Automatic environment detection
  - Helper functions for API calls
  - Consistent endpoint management

### 2. Updated All Frontend Components
The following components were updated to use the centralized API configuration:
- `ProductsContext.js` - Product management
- `FlashProductsContext.js` - Flash product management  
- `services/auth.js` - User authentication
- `PayHereCheckout.js` - Payment processing
- `Orders.js` - Order management
- `EmailTest.js` - Email testing
- `Chatbot.js` - Customer chat
- `AdminPanel.js` - Admin functionality

### 3. Environment Configuration Files
- **`.env.example`** - Template for local development
- **`.env.production`** - Production configuration (needs your backend URL)

## Setup Instructions

### For Local Development
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. The default localhost URL will work for local development

### For Production Deployment

#### Step 1: Deploy Backend to Vercel
1. Deploy your backend (`Backend/` folder) to Vercel first
2. Note the deployment URL (e.g., `https://anne-backend-xyz.vercel.app`)

#### Step 2: Configure Frontend for Production
1. Edit `Frontend/.env.production`
2. Replace the placeholder URL with your actual backend URL:
   ```
   REACT_APP_API_URL=https://your-actual-backend-url.vercel.app
   ```

#### Step 3: Deploy Frontend to Vercel
1. Deploy your frontend (`Frontend/` folder) to Vercel
2. Vercel will automatically use `.env.production` for production builds

## Environment Variables

### Frontend Environment Variables
- **`REACT_APP_API_URL`** - Backend API base URL
  - Local: `http://localhost:5000`
  - Production: `https://your-backend-url.vercel.app`

### Backend Environment Variables (if needed)
- **`FRONTEND_URL`** - Frontend URL for CORS and redirects
  - Local: `http://localhost:3000`
  - Production: `https://your-frontend-url.vercel.app`

## Testing the Connection

### 1. Check API Configuration
Open browser console on your frontend and look for:
```
🔗 API Configuration loaded: {
  baseUrl: "https://your-backend-url.vercel.app",
  environment: "production",
  isProduction: true
}
```

### 2. Test API Endpoints
- Visit your frontend
- Try loading products, creating orders, or using the chat
- Check browser Network tab for successful API calls to your backend URL

### 3. Common Issues
- **CORS errors**: Make sure your backend allows requests from your frontend domain
- **404 errors**: Verify your backend URL is correct and accessible
- **Mixed content**: Ensure both frontend and backend use HTTPS in production

## Files Modified

### New Files Created:
- `Frontend/src/config/api.js` - API configuration
- `Frontend/.env.example` - Development environment template
- `Frontend/.env.production` - Production environment template
- `DEPLOYMENT_SETUP.md` - This setup guide

### Files Updated:
- `Frontend/src/context/ProductsContext.js`
- `Frontend/src/context/FlashProductsContext.js`
- `Frontend/src/services/auth.js`
- `Frontend/src/components/PayHereCheckout.js`
- `Frontend/src/components/Orders.js`
- `Frontend/src/components/EmailTest.js`
- `Frontend/src/components/Chatbot.js`
- `Frontend/src/components/AdminPanel.js`

## Next Steps

1. **Deploy Backend**: Deploy your backend to Vercel and get the URL
2. **Update Production Config**: Edit `.env.production` with your backend URL
3. **Deploy Frontend**: Deploy your frontend to Vercel
4. **Test Connection**: Verify that frontend and backend communicate properly

Your applications should now connect properly when deployed! 🚀
