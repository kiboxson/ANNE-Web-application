# Deploy Backend to Vercel - Fix Cart API 404 Error

## Issue
The cart API endpoints are returning 404 errors on the deployed Vercel backend, even though they work locally.

## Root Cause
The backend needs to be redeployed to Vercel with the latest cart functionality.

## Solution Steps

### 1. Verify Current Deployment
```bash
# Test current deployment
curl https://anne-web-application.vercel.app/
curl https://anne-web-application.vercel.app/api/cart/test-user
```

### 2. Deploy Backend to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Navigate to backend directory
cd Backend

# Deploy to Vercel
vercel --prod

# Follow prompts:
# - Link to existing project: Yes
# - Project name: anne-backend or anne-web-application
# - Directory: ./
```

#### Option B: Using Git Push (if connected to GitHub)
```bash
# From project root
git add .
git commit -m "Fix cart API endpoints for Vercel deployment"
git push origin main
```

### 3. Environment Variables
Ensure these environment variables are set in Vercel dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Verify Deployment
After deployment, test these endpoints:

```bash
# Root endpoint
curl https://YOUR-VERCEL-URL/

# Cart endpoints
curl https://YOUR-VERCEL-URL/api/cart/test-user
curl -X POST https://YOUR-VERCEL-URL/api/cart/test-user/add \
  -H "Content-Type: application/json" \
  -d '{"product":{"id":"test","title":"Test","price":10},"quantity":1}'
```

### 5. Update Frontend Environment
If backend URL changes, update `Frontend/.env.production`:
```
REACT_APP_API_URL=https://YOUR-NEW-VERCEL-URL
```

## Files to Check
- ✅ `vercel.json` - Correct routing configuration
- ✅ `index.js` - Exports app for Vercel
- ✅ `package.json` - Correct start script
- ✅ Cart API endpoints - All implemented

## Expected Result
After deployment, cart API should work:
- GET /api/cart/:userId ✅
- POST /api/cart/:userId/add ✅
- PUT /api/cart/:userId/item/:itemId ✅
- DELETE /api/cart/:userId/item/:itemId ✅
- DELETE /api/cart/:userId ✅
