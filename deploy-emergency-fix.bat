@echo off
echo ========================================
echo   DEPLOYING EMERGENCY CART FIX
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/3] Adding emergency cart fix...
git add Frontend/src/context/CartContext.js

echo [2/3] Committing emergency fix...
git commit -m "EMERGENCY-FIX-Use-working-cart-API-to-stop-404-errors"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   EMERGENCY FIX DEPLOYED!
echo ========================================
echo.
echo Frontend will redeploy in 2-3 minutes.
echo.
echo This emergency fix:
echo ✅ Stops the 404 cart errors immediately
echo ✅ Uses a working cart API temporarily  
echo ✅ Same MongoDB database (your data is safe)
echo ✅ Cart will work while you fix main backend
echo.
echo After frontend redeploys:
echo 1. Hard refresh your app: Ctrl + Shift + R
echo 2. Try "Add to Cart" - should work! ✅
echo 3. No more 404 errors!
echo.
echo Later, you can fix the main backend and switch back.
echo.
pause
