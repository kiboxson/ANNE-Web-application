@echo off
echo ========================================
echo   DEPLOYING CART ROUTES TO VERCEL
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/3] Adding all files...
git add .

echo [2/3] Committing cart routes...
git commit -m "Deploy-cart-routes-to-vercel"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT TRIGGERED!
echo ========================================
echo.
echo Vercel will auto-deploy in 2-3 minutes.
echo.
echo The vercel.json file will route:
echo   POST /api/cart/add     → Backend/index.js
echo   GET  /api/cart/userId  → Backend/index.js
echo   DELETE /api/cart/remove → Backend/index.js
echo.
echo After deployment:
echo 1. Visit: https://anne-web-application.vercel.app/
echo 2. Should show version 1.0.3 (not 1.0.0)
echo 3. Run: node test-cart-direct.js
echo 4. Should show: SUCCESS!
echo 5. Test cart in your app - should work!
echo.
pause
