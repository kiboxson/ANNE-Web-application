@echo off
echo ========================================
echo   MOVING CART FILES TO BACKEND
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/4] Adding all cart files to Backend...
git add Backend/api/cart.js
git add Backend/models/Cart.js
git add Backend/controllers/cartController.js
git add Backend/routes/cartRoutes.js

echo [2/4] Adding working-cart files...
git add working-cart/

echo [3/4] Committing cart consolidation...
git commit -m "CONSOLIDATE-Move-all-cart-files-to-Backend-folder"

echo [4/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   CART FILES MOVED TO BACKEND!
echo ========================================
echo.
echo Files moved:
echo ✅ Backend/api/cart.js - Serverless cart function
echo ✅ Backend/models/Cart.js - Cart database model
echo ✅ Backend/controllers/cartController.js - Cart business logic
echo ✅ Backend/routes/cartRoutes.js - Cart API routes
echo ✅ working-cart/ - Working cart API (backup)
echo.
echo Now you have:
echo 1. Serverless cart function in Backend/api/
echo 2. Express cart routes in Backend/routes/
echo 3. Cart model and controller in Backend/
echo 4. All cart code consolidated in Backend folder
echo.
echo Next steps:
echo 1. Update main Backend/index.js to use cart routes
echo 2. Test cart functionality
echo 3. Deploy to Vercel
echo.
pause
