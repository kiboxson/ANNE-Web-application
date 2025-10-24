@echo off
echo ========================================
echo   Deploying Serverless Cart Functions
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/3] Adding serverless functions...
git add api/

echo [2/3] Committing...
git commit -m "Add-serverless-cart-functions"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Deployment Started!
echo ========================================
echo.
echo Vercel will auto-deploy in 2-3 minutes.
echo.
echo IMPORTANT - Set Environment Variable:
echo 1. Go to: https://vercel.com/dashboard
echo 2. Click your project
echo 3. Settings - Environment Variables
echo 4. Add: MONGODB_URI
echo 5. Value: mongodb+srv://kiboxsonleena:20040620Kiyu@cluster0.cr1byep.mongodb.net/passkey?retryWrites=true^&w=majority^&appName=Cluster0
echo.
echo After deployment completes:
echo - Test: node test-vercel-endpoints.js
echo - Or open your app and try Add to Cart
echo.
echo Cart should work! ✅
echo.
pause
