# 🚀 Vercel Deployment Setup - URGENT FIX

## Problem
Your Backend code is updated in GitHub but Vercel isn't deploying it because you need **TWO separate Vercel projects**:
1. **Backend Project** (serves API at `anne-web-application.vercel.app`)
2. **Frontend Project** (serves React app)

## Current Status
- ✅ Backend code fixed in GitHub (commit `757f4f4`)
- ❌ Vercel Backend project not deploying the updates
- ❌ Cart API returning 404 errors

## Solution: Deploy Backend Separately

### Option 1: Update Existing Backend Project (RECOMMENDED)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your Backend project** (likely named `anne-web-application`)
3. **Go to Settings → Git**
4. **Check Root Directory**: Should be set to `Backend`
5. **Trigger Redeploy**:
   - Go to **Deployments** tab
   - Click the **3 dots** on latest deployment
   - Click **Redeploy**
   - Select **Use existing Build Cache: NO**

### Option 2: Create New Backend Deployment

If the Backend isn't deployed separately:

1. **Create New Project** in Vercel Dashboard
2. **Import** your GitHub repo: `kiboxson/ANNE-Web-application`
3. **Configure Project**:
   - **Project Name**: `anne-backend` (or keep existing name)
   - **Framework Preset**: Other
   - **Root Directory**: `Backend` ⚠️ IMPORTANT
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
   NODE_ENV=production
   ```

5. **Deploy**

### Verify Deployment

After deployment, test these URLs:

```bash
# 1. Check version (should show 1.0.1)
curl https://anne-web-application.vercel.app/

# 2. Check cart endpoints are listed
# Should show: cart, cartAdd, cartRemove, cartClear

# 3. Test cart endpoint
curl https://anne-web-application.vercel.app/api/cart/test-user
```

Expected response from root:
```json
{
  "version": "1.0.1",
  "lastUpdate": "2025-10-24 - Cart API Fixed",
  "endpoints": {
    "cart": "/api/cart/:userId",
    "cartAdd": "/api/cart/add",
    "cartRemove": "/api/cart/remove",
    "cartClear": "/api/cart/clear"
  }
}
```

## Quick Test Commands

Run these after Vercel deploys:

```bash
# From Backend directory
node test-vercel-deployment.js
```

Expected output:
- ✅ Root endpoint working (version 1.0.1)
- ✅ Cart endpoints listed
- ✅ GET cart endpoint working
- ✅ POST cart/add endpoint working

## If Still Not Working

### Check Vercel Project Settings:
1. **Root Directory**: Must be `Backend`
2. **Build Settings**: Should use `vercel.json` from Backend folder
3. **Environment Variables**: MONGODB_URI must be set
4. **Deployment Logs**: Check for errors

### Force Fresh Deployment:
1. Delete `.vercel` folder in Backend (if exists)
2. In Vercel Dashboard: Settings → General → Delete Project
3. Create new project with correct settings
4. Redeploy

## Timeline
- ⏱️ Vercel deployment takes 1-2 minutes
- 🔄 May need to clear browser cache after deployment
- ✅ Cart should work immediately after successful deployment

## Current Backend Status
- **GitHub**: ✅ Updated (commit `757f4f4`)
- **Vercel**: ❌ Not deployed yet
- **Action Needed**: Trigger Vercel redeploy with correct root directory

---

**Next Steps**: Follow Option 1 to redeploy the existing Backend project, then test with the verification commands above.
