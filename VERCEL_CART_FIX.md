# 🚨 Vercel Cart Page Error Fix Guide

## 🎯 **Current Issues**
- Cart page showing errors in Vercel production
- Add to cart button not working
- Database connection failures

## 🔧 **Step-by-Step Fix**

### **Step 1: Set MongoDB URI in Vercel (CRITICAL)**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your backend project** (anne-web-application)
3. **Go to Settings → Environment Variables**
4. **Add this variable:**
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0`
   - **Environments**: Check ALL (Production, Preview, Development)
5. **Click Save**

### **Step 2: Redeploy Backend**

1. **In Vercel Dashboard → Deployments tab**
2. **Click "Redeploy" on the latest deployment**
3. **Wait for deployment to complete**
4. **Check function logs for "Connected to MongoDB Atlas successfully!"**

### **Step 3: Test Cart Functionality**

**Test these URLs directly in browser:**

1. **Environment Check**: 
   ```
   https://anne-web-application.vercel.app/api/health/env
   ```
   **Expected**: `{"hasMongoUri": true, "connectionState": 1}`

2. **MongoDB Health**: 
   ```
   https://anne-web-application.vercel.app/api/health/cart
   ```
   **Expected**: `{"mongoConnected": true, "cartCollectionAccessible": true}`

3. **Cart API Test** (replace USER_ID with your Firebase UID):
   ```
   https://anne-web-application.vercel.app/api/cart/YOUR_USER_ID
   ```
   **Expected**: `{"userId": "YOUR_USER_ID", "items": []}`

### **Step 4: Frontend Cart Test**

1. **Login to your application**
2. **Try adding items to cart**
3. **Check browser console for errors**
4. **Refresh page - items should persist**

## 🐛 **Common Error Solutions**

### **Error: "Database service temporarily unavailable"**
**Cause**: MongoDB URI not set in Vercel
**Fix**: Complete Step 1 above

### **Error: "Failed to add item to cart"**
**Cause**: Backend API endpoints not working
**Fix**: Complete Step 2 (redeploy backend)

### **Error: "Please sign in to add items to cart"**
**Cause**: This is expected behavior for logged-out users
**Fix**: Login to your account

### **Error: Cart items disappear after refresh**
**Cause**: Database not saving data
**Fix**: Check MongoDB Atlas connection and Step 1

## 🔍 **Debug Commands**

### **Check Vercel Function Logs:**
1. Go to Vercel Dashboard → Functions
2. Click on your backend function
3. Check logs for MongoDB connection messages

### **Test API Endpoints:**
```bash
# Test environment
curl https://anne-web-application.vercel.app/api/health/env

# Test MongoDB
curl https://anne-web-application.vercel.app/api/health/cart

# Test cart (replace USER_ID)
curl https://anne-web-application.vercel.app/api/cart/YOUR_USER_ID
```

## ✅ **Success Indicators**

After completing the fixes, you should see:

1. **Environment API**: `hasMongoUri: true`
2. **MongoDB API**: `mongoConnected: true`
3. **Cart API**: Returns user cart data
4. **Frontend**: Add to cart works and persists
5. **MongoDB Atlas**: Data visible in `passkey` → `carts` collection

## 🚨 **If Still Not Working**

### **Check MongoDB Atlas Settings:**

1. **Network Access**: Ensure `0.0.0.0/0` is allowed
2. **Database Access**: Verify user `kiboxsonleena` has read/write permissions
3. **Database**: Confirm `passkey` database exists
4. **Cluster**: Make sure cluster is not paused

### **Verify Connection String:**
The MongoDB URI should be exactly:
```
mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
```

### **Contact Support:**
If issues persist, check:
- Vercel function logs for specific error messages
- Browser console for frontend errors
- MongoDB Atlas logs for connection issues

## 🎉 **Expected Final Result**

- ✅ Logged-in users can add items to cart
- ✅ Cart items persist after page refresh
- ✅ Data saves to MongoDB Atlas database
- ✅ Logged-out users see "Sign in to Add" buttons
- ✅ No errors in cart page or add to cart functionality
