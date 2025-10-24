# 🔍 Test Vercel Cart - Step by Step

## Current Issue
Getting 404 error when trying to load cart on Vercel:
```
Request failed with status code 404
Cannot GET /api/cart/{userId}
```

## Quick Tests to Run

### Test 1: Check if Backend is Deployed

Open this URL in your browser:
```
https://anne-web-application.vercel.app/
```

**What to look for:**
- Should show JSON with version and status
- Check if `mongoStatus` shows "✅ Connected" or "❌ Disconnected"

**If you get 404 or error:**
- Backend deployment failed
- Need to redeploy

---

### Test 2: Check Cart Diagnostic

Open this URL:
```
https://anne-web-application.vercel.app/api/cart/diagnostic
```

**Expected response:**
```json
{
  "success": true,
  "diagnostic": {
    "mongoConnection": {
      "isConnected": true
    }
  }
}
```

**If you get 404:**
- Routes not configured properly
- Need to check Vercel deployment

---

### Test 3: Check Health Endpoint

Open this URL:
```
https://anne-web-application.vercel.app/api/health/db
```

**Expected response:**
```json
{
  "mongoConnected": true,
  "connectionState": 1
}
```

**If mongoConnected is false:**
- Environment variables not set in Vercel
- MongoDB Atlas network access issue

---

## 🔧 Fix Steps

### Step 1: Verify Vercel Deployment

1. Go to **https://vercel.com/dashboard**
2. Find your backend project
3. Check **Deployments** tab
4. Look at the latest deployment
5. Check if it shows "Ready" status

**If deployment failed:**
- Click on the deployment
- Check the build logs for errors
- Look for any error messages

---

### Step 2: Set Environment Variables (CRITICAL)

**This is the most common issue!**

1. Go to Vercel Dashboard
2. Select your **backend project**
3. Go to **Settings** → **Environment Variables**
4. Add these **THREE** variables:

#### Variable 1:
```
Name: MONGODB_URI
Value: mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
```

#### Variable 2:
```
Name: NODE_ENV
Value: production
```

#### Variable 3:
```
Name: FRONTEND_URL
Value: https://anne-web-application-zs5b.vercel.app
```

5. **IMPORTANT:** After adding variables, click **Redeploy**

---

### Step 3: Force Redeploy

After setting environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (...)** menu
4. Click **Redeploy**
5. **Check "Use existing Build Cache"** is UNCHECKED
6. Click **Redeploy**
7. Wait for deployment to complete

---

### Step 4: Verify MongoDB Atlas Network Access

1. Go to **https://cloud.mongodb.com**
2. Select your cluster
3. Go to **Network Access** (left sidebar)
4. Check if **0.0.0.0/0** is in the IP Access List
5. If not, click **Add IP Address**
6. Select **Allow Access from Anywhere**
7. Enter: `0.0.0.0/0`
8. Click **Confirm**
9. Wait 1-2 minutes for changes to apply

---

## 🧪 After Redeployment - Test Again

### Test in Browser Console

Open your Vercel app and press F12, then run:

```javascript
// Test 1: Check backend root
fetch('https://anne-web-application.vercel.app/')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));

// Test 2: Check MongoDB connection
fetch('https://anne-web-application.vercel.app/api/health/db')
  .then(r => r.json())
  .then(d => console.log('MongoDB:', d));

// Test 3: Try to add to cart
fetch('https://anne-web-application.vercel.app/api/cart/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-' + Date.now(),
    product: {
      id: 'test-1',
      title: 'Test Product',
      price: 50,
      image: 'test.jpg',
      category: 'Test',
      description: 'Test',
      stock: 10
    },
    quantity: 1,
    userDetails: {
      username: 'Test',
      email: 'test@test.com',
      phone: '123'
    }
  })
})
.then(r => r.json())
.then(d => console.log('Cart Add:', d))
.catch(e => console.error('Cart Error:', e));
```

---

## 🎯 Expected Results

### If Everything Works:

**Backend Root:**
```json
{
  "message": "🚀 ANNE Web Application Backend API",
  "version": "1.0.2",
  "mongoStatus": "✅ Connected"
}
```

**MongoDB Health:**
```json
{
  "mongoConnected": true,
  "connectionState": 1
}
```

**Cart Add:**
```json
{
  "success": true,
  "message": "Added Test Product to cart",
  "summary": {
    "itemsInCart": 1,
    "totalQuantity": 1,
    "totalAmount": 119.98
  }
}
```

---

## ❌ Common Issues & Solutions

### Issue 1: Backend Returns 404 for Everything
**Cause:** Deployment failed or routes not configured
**Solution:**
1. Check Vercel deployment logs
2. Redeploy with fresh build (uncheck cache)
3. Verify `vercel.json` exists in Backend folder

### Issue 2: Backend Works but MongoDB Not Connected
**Cause:** Environment variables not set
**Solution:**
1. Add MONGODB_URI in Vercel Settings
2. Redeploy after adding variables
3. Check MongoDB Atlas Network Access

### Issue 3: Cart Endpoints Return 404
**Cause:** Routes not properly configured in Vercel
**Solution:**
1. Verify `Backend/vercel.json` has cart routes
2. Check if `Backend/api/cart/add.js` exists
3. Redeploy with fresh build

### Issue 4: CORS Errors
**Cause:** Frontend URL not allowed
**Solution:**
1. Check CORS configuration in `Backend/index.js`
2. Verify frontend URL is correct
3. Add FRONTEND_URL environment variable

---

## 🆘 Emergency Fix

If nothing works, try this:

### Option 1: Manual Serverless Function Test

The serverless functions should work automatically. Test directly:

```
https://anne-web-application.vercel.app/api/cart/add
```

This should work even if the main routing doesn't.

### Option 2: Check Vercel Function Logs

1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Go to **Functions** tab
4. Look for errors in function logs
5. Check if functions are being created

### Option 3: Create New Deployment

Sometimes Vercel caches old builds:

1. Make a small change (add a comment in `index.js`)
2. Commit and push
3. This forces a fresh deployment

---

## 📞 What to Check Right Now

Please run these tests and tell me the results:

1. **Test Backend Root:**
   - Visit: `https://anne-web-application.vercel.app/`
   - What do you see?

2. **Test MongoDB:**
   - Visit: `https://anne-web-application.vercel.app/api/health/db`
   - What does it say?

3. **Check Vercel Settings:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Do you see MONGODB_URI, NODE_ENV, FRONTEND_URL?
   - Screenshot if possible

4. **Check Deployment Status:**
   - Vercel Dashboard → Deployments
   - Is the latest deployment "Ready"?
   - Any errors shown?

With this information, I can tell you exactly what needs to be fixed! 🔧
