# Cart Not Saving to Database - Troubleshooting Guide

## Issue
Products are not being saved to the MongoDB Atlas `carts` collection even though the functionality appears to be working.

## Possible Causes & Solutions

### 1. Backend Server Not Running
**Check:** Is the backend server running?

```bash
cd Backend
npm start
```

**Expected output:** You should see:
- `✅ Connected to MongoDB Atlas successfully!`
- `🚀 Server running on port 5000`

---

### 2. MongoDB Not Connected
**Check:** Test MongoDB connection

```bash
cd Backend
node diagnose-cart.js
```

This will test:
- MongoDB URI configuration
- Connection to MongoDB Atlas
- Cart collection existence
- Ability to save/retrieve carts

**If connection fails:**
- Check internet connection
- Verify MongoDB Atlas credentials
- Check MongoDB Atlas Network Access (should allow 0.0.0.0/0)

---

### 3. Frontend Not Sending Requests
**Check:** Open browser DevTools Console (F12) and look for:

When you click "Add to Cart", you should see:
```
🛒 ENHANCED ADD TO CART: {product details}
👤 User Info: {user details}
📦 Sending product details: {...}
👤 Sending user details: {...}
✅ Add response: {...}
🎉 Added {product} to cart!
📊 Cart Summary: {...}
💾 Saved to MongoDB carts collection
```

**If you see errors:**
- Check Network tab in DevTools
- Look for failed requests to `/api/cart/add`
- Check the error message

---

### 4. User Not Logged In
**Check:** The cart requires a logged-in user (Firebase authentication)

**Solution:**
1. Make sure you're signed in
2. Check browser console for user info logs
3. Verify Firebase authentication is working

---

### 5. Backend Console Logs
**Check:** Look at the backend terminal/console when adding to cart

**You should see:**
```
🛒 ENHANCED CART ADD - User: {userId}, Product: {productTitle}
📦 Product Details: {...}
👤 User Details: {...}
🆕 Creating new cart for user: {userId}
➕ Added new item: {productTitle}
✅ Cart saved to MongoDB Atlas 'carts' collection
📊 Cart Summary: 1 items, 1 total quantity, ${total} total
💾 MongoDB Document ID: {mongoId}
```

**If you see:**
```
❌ MongoDB not connected
```
Then MongoDB connection failed. Run the diagnostic script.

---

### 6. Wrong API Endpoint
**Check:** Verify frontend is calling the correct endpoint

The frontend should call: `POST /api/cart/add`

**Check in browser Network tab:**
- Request URL should be: `http://localhost:5000/api/cart/add`
- Method: POST
- Request body should include: userId, product, quantity, userDetails

---

## Quick Diagnostic Steps

### Step 1: Run Backend Diagnostic
```bash
cd Backend
node diagnose-cart.js
```

### Step 2: Check Backend Server
```bash
cd Backend
npm start
```
Leave this running and watch the console.

### Step 3: Test from Frontend
1. Open the app in browser
2. Open DevTools Console (F12)
3. Sign in to your account
4. Click "Add to Cart" on any product
5. Watch both browser console AND backend console

### Step 4: Check MongoDB Atlas
1. Log in to MongoDB Atlas
2. Go to your cluster
3. Click "Browse Collections"
4. Select `passkey` database
5. Look for `carts` collection
6. Check if any documents exist

---

## Manual Test Using Postman/cURL

If the frontend isn't working, test the backend directly:

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "product": {
      "id": "prod-1",
      "title": "Test Product",
      "price": 99.99,
      "image": "https://example.com/image.jpg",
      "category": "Test",
      "description": "Test description",
      "stock": 10
    },
    "quantity": 1,
    "userDetails": {
      "username": "Test User",
      "email": "test@example.com",
      "phone": "+1234567890"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "cart": { ... },
  "message": "Added Test Product to cart",
  "summary": {
    "itemsInCart": 1,
    "totalQuantity": 1,
    "totalAmount": 119.98
  }
}
```

---

## Common Issues & Fixes

### Issue: "Database not connected" error
**Fix:** 
1. Check MongoDB Atlas is accessible
2. Verify MONGODB_URI in `.env` file
3. Check Network Access in MongoDB Atlas
4. Restart backend server

### Issue: No console logs appearing
**Fix:**
1. Make sure backend server is running
2. Check if you're looking at the correct terminal
3. Restart the backend server

### Issue: Frontend shows success but nothing in database
**Fix:**
1. Check if backend is actually receiving the request
2. Look for errors in backend console
3. Verify MongoDB connection state
4. Check if Cart model is properly defined

### Issue: "Please sign in to add items to cart"
**Fix:**
1. Sign in to the application
2. Check Firebase authentication is working
3. Verify user object has userId property

---

## Expected Behavior

When everything works correctly:

1. **Frontend Console:**
   - Shows product being added
   - Shows user details
   - Shows success message
   - Shows cart summary

2. **Backend Console:**
   - Shows incoming request
   - Shows product and user details
   - Shows cart being saved
   - Shows MongoDB document ID

3. **MongoDB Atlas:**
   - `carts` collection has documents
   - Each document has userId, userDetails, items, orderSummary
   - All product details are present

---

## Still Not Working?

If you've tried all the above and it's still not working:

1. **Check Backend Code:**
   - File: `Backend/index.js`
   - Line: 1634 (POST /api/cart/add endpoint)
   - Verify the enhanced code is present

2. **Check Frontend Code:**
   - File: `Frontend/src/context/CartContext.js`
   - Line: 73 (addItem function)
   - Verify enhanced code is present

3. **Restart Everything:**
   ```bash
   # Stop backend (Ctrl+C)
   # Stop frontend (Ctrl+C)
   
   # Start backend
   cd Backend
   npm start
   
   # Start frontend (in new terminal)
   cd Frontend
   npm start
   ```

4. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached files
   - Reload the page

---

## Contact Information

If the issue persists, provide:
1. Backend console output when adding to cart
2. Frontend console output (F12)
3. Network tab showing the request/response
4. Result of running `diagnose-cart.js`
5. MongoDB Atlas screenshot showing collections
