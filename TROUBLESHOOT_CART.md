# 🔧 Cart Not Saving - Troubleshooting Steps

## Quick Diagnosis

### Step 1: Check if Backend is Running with Updated Code

Open your browser and visit: **http://localhost:5000/**

You should see:
```json
{
  "message": "🚀 ANNE Web Application Backend API",
  "version": "1.0.2",
  "lastUpdate": "2025-10-24 - Enhanced Cart with Complete Details",
  "mongoStatus": "✅ Connected" or "❌ Disconnected"
}
```

**If you see version 1.0.1 or older:** The backend needs to be restarted with the new code.

**If mongoStatus shows "❌ Disconnected":** MongoDB is not connected (see Step 2).

---

### Step 2: Check Cart System Status

Visit: **http://localhost:5000/api/cart/diagnostic**

This will show:
- MongoDB connection status
- Cart endpoint version
- Number of carts in database
- Sample cart structure (if any carts exist)

**Expected response if working:**
```json
{
  "success": true,
  "diagnostic": {
    "mongoConnection": {
      "state": 1,
      "stateText": "connected",
      "isConnected": true,
      "database": "passkey"
    },
    "cartEndpoint": {
      "path": "/api/cart/add",
      "method": "POST",
      "enhanced": true,
      "version": "2.0 - Complete Details"
    },
    "cartsInDatabase": 0
  },
  "message": "✅ Cart system is ready to save to MongoDB"
}
```

---

### Step 3: Test MongoDB Connection

Run the diagnostic script:

```bash
cd Backend
node diagnose-cart.js
```

This will:
- Test MongoDB connection
- Create a test cart
- Save it to database
- Retrieve it
- Verify all fields are present

**If this fails:** MongoDB connection issue (see Solutions below).

---

### Step 4: Test Cart API Directly

Use this command to test the cart endpoint directly:

**Windows PowerShell:**
```powershell
$body = @{
    userId = "test-user-$(Get-Date -Format 'yyyyMMddHHmmss')"
    product = @{
        id = "test-prod-1"
        title = "Test Product"
        price = 99.99
        image = "https://example.com/image.jpg"
        category = "Test"
        description = "Test description"
        stock = 10
    }
    quantity = 1
    userDetails = @{
        username = "Test User"
        email = "test@example.com"
        phone = "+1234567890"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/cart/add" -Method Post -Body $body -ContentType "application/json"
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

**If you get this response:** Backend is working! Issue is in frontend.

---

## Common Issues & Solutions

### Issue 1: Backend Not Running

**Symptoms:**
- Cannot access http://localhost:5000
- "Connection refused" error

**Solution:**
```bash
cd Backend
npm start
```

Watch for:
- `✅ Connected to MongoDB Atlas successfully!`
- `🚀 Server running on port 5000`

---

### Issue 2: MongoDB Not Connected

**Symptoms:**
- mongoStatus shows "❌ Disconnected"
- Error: "Database not connected"

**Solution A - Check Internet Connection:**
- MongoDB Atlas requires internet
- Test: Can you access https://cloud.mongodb.com?

**Solution B - Check MongoDB Atlas Network Access:**
1. Log in to MongoDB Atlas
2. Go to Network Access
3. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
4. Save and wait 1-2 minutes

**Solution C - Check Credentials:**
1. Verify username: `kiboxsonleena`
2. Verify database: `passkey`
3. Check connection string in `.env` file

**Solution D - Restart Backend:**
```bash
# Stop backend (Ctrl+C)
cd Backend
npm start
```

---

### Issue 3: Old Code Running

**Symptoms:**
- Version shows 1.0.1 or older
- Cart endpoint not enhanced

**Solution:**
```bash
# Stop backend (Ctrl+C)
cd Backend
npm start
```

Verify version at http://localhost:5000/

---

### Issue 4: Frontend Not Sending Correct Data

**Symptoms:**
- Backend receives request but missing fields
- Error: "Missing required fields"

**Check Browser Console (F12):**

Look for these logs when clicking "Add to Cart":
```
🛒 ENHANCED ADD TO CART: {...}
👤 User Info: {...}
📦 Sending product details: {...}
👤 Sending user details: {...}
```

**If missing:** Frontend code needs to be updated/restarted.

**Solution:**
```bash
# Stop frontend (Ctrl+C)
cd Frontend
npm start
```

---

### Issue 5: User Not Logged In

**Symptoms:**
- Error: "Please sign in to add items to cart"
- No userId in request

**Solution:**
1. Sign in to the application
2. Check if Firebase authentication is working
3. Look for user info in browser console

---

### Issue 6: Request Not Reaching Backend

**Check Browser Network Tab (F12 → Network):**

When clicking "Add to Cart", look for:
- Request to: `http://localhost:5000/api/cart/add`
- Method: POST
- Status: Should be 201 (Created)

**If 503 error:** MongoDB not connected  
**If 400 error:** Missing required fields  
**If 500 error:** Server error (check backend console)  
**If no request:** Frontend issue

---

## Step-by-Step Verification

### 1. Restart Backend
```bash
cd Backend
npm start
```

### 2. Check Version
Open: http://localhost:5000/
Verify: version is "1.0.2"

### 3. Check MongoDB
Open: http://localhost:5000/api/cart/diagnostic
Verify: "isConnected": true

### 4. Run Diagnostic
```bash
cd Backend
node diagnose-cart.js
```
Verify: All tests pass

### 5. Restart Frontend
```bash
cd Frontend
npm start
```

### 6. Test in Browser
1. Open app
2. Press F12 (DevTools)
3. Go to Console tab
4. Sign in
5. Click "Add to Cart"
6. Watch console logs

### 7. Check Backend Console
Look for:
```
🛒 ENHANCED CART ADD - User: {...}
📦 Product Details: {...}
👤 User Details: {...}
✅ Cart saved to MongoDB Atlas 'carts' collection
💾 MongoDB Document ID: {...}
```

### 8. Verify in MongoDB Atlas
1. Log in to MongoDB Atlas
2. Browse Collections
3. Database: `passkey`
4. Collection: `carts`
5. Check for documents

---

## Still Not Working?

### Collect This Information:

1. **Backend Console Output:**
   - Copy everything when you start the backend
   - Copy logs when adding to cart

2. **Browser Console Output:**
   - Press F12
   - Go to Console tab
   - Copy logs when adding to cart

3. **Network Request:**
   - Press F12
   - Go to Network tab
   - Click "Add to Cart"
   - Find the request to `/api/cart/add`
   - Copy Request Headers and Request Body

4. **Diagnostic Results:**
   ```bash
   cd Backend
   node diagnose-cart.js
   ```
   Copy the entire output

5. **API Diagnostic:**
   Visit: http://localhost:5000/api/cart/diagnostic
   Copy the JSON response

---

## Quick Test Script

Save this as `test-cart-quick.js` in Backend folder:

```javascript
const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing cart API...');
    
    const response = await axios.post('http://localhost:5000/api/cart/add', {
      userId: 'quick-test-' + Date.now(),
      product: {
        id: 'test-1',
        title: 'Quick Test Product',
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
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ Cart is saving to MongoDB!');
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.error === 'Database not connected') {
      console.log('\n⚠️ MongoDB is not connected!');
      console.log('Solutions:');
      console.log('1. Check internet connection');
      console.log('2. Check MongoDB Atlas Network Access');
      console.log('3. Restart backend server');
    }
  }
}

quickTest();
```

Run it:
```bash
cd Backend
node test-cart-quick.js
```

---

## Expected Working State

When everything is working:

✅ Backend shows version 1.0.2  
✅ MongoDB status: Connected  
✅ Diagnostic shows: "Cart system is ready"  
✅ Test script succeeds  
✅ Frontend console shows detailed logs  
✅ Backend console shows cart saved  
✅ MongoDB Atlas shows documents in `carts` collection  

---

## Need Help?

Provide the outputs from:
1. http://localhost:5000/
2. http://localhost:5000/api/cart/diagnostic
3. `node diagnose-cart.js`
4. Backend console when adding to cart
5. Browser console when adding to cart
6. Network tab showing the request
