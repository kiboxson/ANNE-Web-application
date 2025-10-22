# MongoDB Atlas Setup Guide for Vercel Deployment

## 🚨 Issue: Cart items not saving to MongoDB Atlas

Your cart functionality is working but using local storage fallback instead of MongoDB Atlas. This guide will help you fix the database connection.

## 📋 Step-by-Step Solution

### 1. **Check MongoDB Atlas Configuration**

#### A. Network Access Settings
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to **Network Access** → **IP Access List**
3. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - This is required for Vercel serverless functions
   - Comment: "Vercel deployment access"

#### B. Database User Permissions
1. Go to **Database Access** → **Database Users**
2. Verify user `kiboxsonleena` exists with:
   - **Database User Privileges**: `Atlas admin` or `Read and write to any database`
   - **Password**: Ensure it matches your connection string

#### C. Database and Collection
1. Go to **Database** → **Browse Collections**
2. Verify database `passkey` exists
3. The `carts` collection will be created automatically when first cart is saved

### 2. **Set Environment Variable in Vercel**

#### A. Get Your MongoDB Connection String
```
mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
```

#### B. Configure Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend project** (anne-web-application)
3. Go to **Settings** → **Environment Variables**
4. Add new environment variable:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0`
   - **Environments**: Select `Production`, `Preview`, and `Development`

### 3. **Redeploy Backend**

After setting the environment variable:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

### 4. **Test the Connection**

#### A. Using Debug Tools in Frontend
1. Login to your application
2. Go to **Cart** page
3. Click **🐛 Debug** button
4. Click **🧪 Test Cart API** button
5. Check the results

#### B. Direct API Testing
Visit these URLs in your browser:
- **Database Health**: `https://anne-web-application.vercel.app/api/health/db`
- **Cart Health**: `https://anne-web-application.vercel.app/api/health/cart`

Expected successful response for cart health:
```json
{
  "cartCollectionAccessible": true,
  "cartCollectionExists": true,
  "mongoConnected": true,
  "testQuerySuccessful": true,
  "cartCount": 0,
  "databaseName": "passkey",
  "usingFallbackUri": false,
  "message": "Cart collection is accessible. Found 0 carts in database 'passkey'."
}
```

### 5. **Troubleshooting Common Issues**

#### Issue: `usingFallbackUri: true`
**Solution**: Environment variable not set in Vercel
- Double-check the `MONGODB_URI` environment variable in Vercel dashboard
- Ensure it's set for Production environment
- Redeploy after setting

#### Issue: `mongoConnected: false`
**Possible causes**:
1. **Network Access**: Add `0.0.0.0/0` to IP whitelist
2. **Wrong credentials**: Verify username/password in connection string
3. **Database name**: Ensure `passkey` database exists

#### Issue: Connection timeout
**Solution**: 
1. Check MongoDB Atlas cluster status
2. Verify connection string format
3. Ensure cluster is not paused

### 6. **Verify Cart Functionality**

After fixing MongoDB connection:
1. **Login** to your account
2. **Add items** to cart
3. **Refresh** the page - items should persist
4. **Check MongoDB Atlas**: Go to Collections → `passkey` → `carts` to see saved data

### 7. **Environment Variables Summary**

Your Vercel backend should have these environment variables:

```env
MONGODB_URI=mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

## 🔍 Debugging Commands

If you have access to Vercel CLI:

```bash
# Check environment variables
vercel env ls

# Add environment variable
vercel env add MONGODB_URI

# Redeploy
vercel --prod
```

## 📞 Support

If you continue to have issues:
1. Check the **🐛 Debug** information in your cart page
2. Look at Vercel function logs in the dashboard
3. Verify all steps in this guide are completed

## ✅ Success Indicators

You'll know it's working when:
- ✅ Cart items persist after page refresh
- ✅ Debug shows `mongoConnected: true`
- ✅ Debug shows `usingFallbackUri: false`
- ✅ You can see cart data in MongoDB Atlas Collections
- ✅ Cart count increases in the health check endpoint
