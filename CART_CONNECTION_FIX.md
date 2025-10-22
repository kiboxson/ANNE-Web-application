# 🛒 Cart Database Connection Fix

## 🚨 **Current Issue**
Cart page showing error: "Cart service not found - please contact support"

## 🎯 **Root Cause**
The backend is not properly connected to MongoDB Atlas, causing cart API endpoints to fail.

## 🔧 **Immediate Fix Steps**

### **Step 1: Set MongoDB Environment Variable in Vercel**

**This is the most critical step!**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your backend project** (anne-web-application)
3. **Go to Settings → Environment Variables**
4. **Add this exact variable:**
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0`
   - **Environments**: Check ALL (Production, Preview, Development)
5. **Click "Save"**

### **Step 2: Redeploy Backend**

1. **Go to Vercel Dashboard → Deployments tab**
2. **Click "Redeploy" on the latest deployment**
3. **Wait for deployment to complete (2-3 minutes)**
4. **Check function logs for "Connected to MongoDB Atlas successfully!"**

### **Step 3: Test Connection**

**Test these URLs in your browser:**

1. **Backend Health**: 
   ```
   https://anne-web-application.vercel.app/api/test
   ```
   **Expected**: `{"message": "Backend is working!", "mongoConnected": true}`

2. **Environment Check**: 
   ```
   https://anne-web-application.vercel.app/api/health/env
   ```
   **Expected**: `{"hasMongoUri": true, "connectionState": 1}`

3. **Cart Health**: 
   ```
   https://anne-web-application.vercel.app/api/health/cart
   ```
   **Expected**: `{"mongoConnected": true, "cartCollectionAccessible": true}`

## 🧪 **Local Testing (Optional)**

You can test the cart connection locally:

```bash
cd Backend
node test-cart-connection.js
```

**Expected output:**
```
✅ Connected to MongoDB Atlas successfully!
✅ Database ping successful!
✅ Test cart created successfully!
✅ All cart database tests passed!
```

## 🔍 **Troubleshooting**

### **If Step 3 tests fail:**

1. **Check MongoDB Atlas Settings:**
   - **Network Access**: Ensure `0.0.0.0/0` is in IP Access List
   - **Database Access**: Verify user `kiboxsonleena` has read/write permissions
   - **Database**: Confirm `passkey` database exists
   - **Cluster**: Make sure cluster is not paused

2. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions
   - Click on your backend function
   - Look for MongoDB connection messages

### **Common Error Messages:**

- **"Cart service not found"** → Backend not deployed or MONGODB_URI not set
- **"Database service temporarily unavailable"** → MongoDB connection failing
- **"Please sign in to add items to cart"** → User not logged in (expected behavior)

## ✅ **Success Indicators**

After completing the fix:

1. **✅ Backend Test**: Shows `mongoConnected: true`
2. **✅ Environment Test**: Shows `hasMongoUri: true, connectionState: 1`
3. **✅ Cart Test**: Shows `mongoConnected: true, cartCollectionAccessible: true`
4. **✅ Frontend**: Cart page loads without errors
5. **✅ Add to Cart**: Works for logged-in users
6. **✅ Persistence**: Cart items remain after page refresh

## 🎉 **Expected Final Behavior**

### **For Logged-In Users:**
- ✅ Can add items to cart
- ✅ Items persist after page refresh
- ✅ Cart data saves to MongoDB Atlas
- ✅ Can view, update, and remove cart items

### **For Logged-Out Users:**
- 🔒 See "Sign in to Add" buttons (disabled)
- 📱 Get "Please sign in" messages when clicking
- 💡 Clear guidance to log in for cart functionality

## 🚀 **Next Steps After Fix**

1. **Test cart functionality** with logged-in user
2. **Verify data persistence** by refreshing page
3. **Check MongoDB Atlas** for cart data in `passkey` → `carts` collection
4. **Test authentication flow** (login → add to cart → logout → login → check cart)

The cart will be fully connected to the MongoDB Atlas database and work seamlessly!
