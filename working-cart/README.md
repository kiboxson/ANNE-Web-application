# Working Cart API - Vercel Deployment

## 🚀 Quick Deploy

This is a standalone cart API that can be deployed independently to Vercel.

### Deploy to Vercel:

1. **Go to:** https://vercel.com/new
2. **Import:** kiboxson/ANNE-Web-application
3. **Configure:**
   - **Project Name:** `working-cart-api`
   - **Root Directory:** `working-cart` ⭐ **IMPORTANT!**
   - **Framework Preset:** Other
4. **Environment Variables:**
   - Add `MONGODB_URI` with your MongoDB connection string
5. **Deploy!**

### Environment Variables Required:

```
MONGODB_URI=mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
```

## 📋 API Endpoints

### Add to Cart
```
POST /api/cart
Body: {
  userId: "user123",
  product: {
    id: "prod1",
    title: "Product Name",
    price: 99.99,
    image: "url",
    category: "category"
  },
  quantity: 1
}
```

### Get Cart
```
GET /api/cart?userId=user123
```

### Remove from Cart
```
DELETE /api/cart
Body: {
  userId: "user123",
  productId: "prod1"
}
```

## 🔧 Troubleshooting 404 Errors

If you get a 404 error after deployment:

1. **Check Root Directory:**
   - Go to Vercel Dashboard → Settings → General
   - Verify "Root Directory" is set to `working-cart`
   - Save and redeploy

2. **Check Build Logs:**
   - Go to Deployments → Click on latest deployment
   - Check build logs for errors

3. **Verify File Structure:**
   ```
   working-cart/
   ├── api/
   │   └── cart.js
   ├── package.json
   ├── vercel.json
   └── README.md
   ```

4. **Test Endpoint:**
   ```
   https://your-deployment.vercel.app/api/cart
   ```

## ✅ Expected Response

When you visit `/api/cart` without parameters, you should get:
```json
{
  "success": false,
  "error": "Missing userId parameter"
}
```

This confirms the API is working!

## 🎯 Integration with Frontend

Update your Frontend CartContext.js:

```javascript
const CART_API_BASE = 'https://your-working-cart.vercel.app';
```

Then deploy frontend and test!
