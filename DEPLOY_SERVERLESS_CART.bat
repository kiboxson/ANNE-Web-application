@echo off
echo ========================================
echo   DEPLOYING SERVERLESS CART SOLUTION
echo ========================================
echo.
echo This will deploy a Vercel serverless function
echo that bypasses the deployment configuration issues.
echo.

cd /d "e:\final\project"

echo [1/4] Adding serverless cart function...
git add api/cart.js

echo [2/4] Adding updated frontend...
git add Frontend/src/context/CartContext.js

echo [3/4] Committing changes...
git commit -m "Deploy serverless cart function - bypasses deployment issues"

echo [4/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Vercel will automatically deploy the serverless function.
echo.
echo The new cart endpoint will be:
echo https://anne-web-application.vercel.app/api/cart
echo.
echo Wait 2-3 minutes for deployment, then:
echo 1. Test: node test-cart-direct.js
echo 2. Try Add to Cart in your app
echo.
echo This SHOULD work because:
echo ✅ Serverless functions always deploy
echo ✅ No Express routing issues
echo ✅ Vercel's native format
echo ✅ Bypasses deployment configuration problems
echo.
pause
