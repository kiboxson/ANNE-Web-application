@echo off
echo ========================================
echo   FIXING WORKING-CART 404 ERROR
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/3] Adding fixed working-cart files...
git add working-cart/vercel.json
git add working-cart/README.md

echo [2/3] Committing 404 fix...
git commit -m "FIX-working-cart-404-error-add-builds-and-routes"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   WORKING-CART 404 FIX DEPLOYED!
echo ========================================
echo.
echo Changes made:
echo ✅ Updated vercel.json with builds and routes
echo ✅ Added README with deployment instructions
echo.
echo Vercel will auto-redeploy in 2-3 minutes.
echo.
echo After redeployment:
echo 1. Test endpoint: https://your-deployment.vercel.app/api/cart
echo 2. Should get: {"success":false,"error":"Missing userId parameter"}
echo 3. This confirms API is working!
echo.
echo If still getting 404:
echo 1. Go to Vercel Dashboard
echo 2. Settings → General → Root Directory
echo 3. Set to: working-cart
echo 4. Save and redeploy
echo.
pause
