# Vercel Deployment Guide for ANNE Web Application

## Backend Deployment

### 1. Deploy Backend to Vercel

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Select Backend Folder**: Choose the `Backend` folder as the root directory
3. **Configure Environment Variables** in Vercel Dashboard:

#### Required Environment Variables:

```
MONGODB_URI=mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### 2. MongoDB Atlas Configuration

#### Check MongoDB Atlas Settings:
1. **Network Access**: Ensure `0.0.0.0/0` is allowed (or add Vercel IPs)
2. **Database User**: Verify username `kiboxsonleena` has read/write permissions
3. **Connection String**: Ensure the connection string is correct
4. **Database Name**: Confirm `passkey` database exists

#### Test MongoDB Connection:
```bash
# Test connection string locally
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-connection-string')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err.message));
"
```

### 3. Frontend Deployment

1. **Deploy Frontend**: Deploy the `Frontend` folder to Vercel
2. **Environment Variables**:
```
REACT_APP_API_URL=https://your-backend-app.vercel.app
```

### 4. Troubleshooting Cart Issues

#### Common Issues:
1. **MongoDB Connection Timeout**: Check Network Access in MongoDB Atlas
2. **Environment Variables**: Verify all variables are set in Vercel dashboard
3. **CORS Issues**: Backend automatically handles Vercel domains
4. **Database Permissions**: Ensure user has proper read/write access

#### Debug Steps:
1. Check Vercel Function logs for MongoDB connection errors
2. Verify environment variables in Vercel dashboard
3. Test API endpoints directly: `https://your-backend.vercel.app/api/health/db`
4. Check MongoDB Atlas logs for connection attempts

### 5. Cart Collection Setup

The cart collection will be automatically created when first accessed. Ensure:
- Database name is `passkey`
- User has write permissions
- Network access allows Vercel connections

### 6. Production URLs

After deployment, update these URLs:
- **Backend**: `https://anne-web-application.vercel.app`
- **Frontend**: `https://your-frontend-name.vercel.app`

### 7. Testing Cart Functionality

1. **Health Check**: Visit `/api/health/db` to verify MongoDB connection
2. **Cart API**: Test `/api/cart/test-user` to verify cart collection access
3. **Frontend**: Test add to cart functionality in production

## Important Notes

- MongoDB Atlas must allow connections from `0.0.0.0/0` for Vercel
- Environment variables must be set in Vercel dashboard, not in code
- Cart collection will be created automatically on first use
- Backend includes fallback mechanisms if MongoDB is temporarily unavailable
