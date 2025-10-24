@echo off
echo ========================================
echo   DEPLOYING CONSOLIDATED CART FILES
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/3] Adding consolidated cart documentation...
git add Backend/CART_FILES_CONSOLIDATED.md

echo [2/3] Committing cart consolidation documentation...
git commit -m "CONSOLIDATE-Document-all-cart-files-organization"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   CART FILES CONSOLIDATED!
echo ========================================
echo.
echo ✅ BACKEND CART FILES (Main Implementation):
echo    - Backend/api/cart.js
echo    - Backend/models/Cart.js
echo    - Backend/controllers/cartController.js
echo    - Backend/routes/cartRoutes.js
echo.
echo ✅ ROOT CART FILES (Deployment Options):
echo    - api/cart.js (can be removed - duplicate)
echo    - cart-only/ (standalone deployment option)
echo    - working-cart/ (backup deployment option)
echo.
echo ✅ FRONTEND CART FILES:
echo    - Frontend/src/context/CartContext.js
echo    - Frontend/src/components/Cart.js
echo    - Frontend/src/config/api.js
echo.
echo 📋 DEPLOYMENT OPTIONS:
echo.
echo Option 1: Use Backend Serverless Function
echo   - File: Backend/api/cart.js
echo   - Vercel: Set Root Directory to "Backend"
echo   - Endpoint: /api/cart
echo.
echo Option 2: Deploy Separate Cart API
echo   - Folder: cart-only/
echo   - Create new Vercel project
echo   - Root Directory: "cart-only"
echo   - Endpoint: /api/cart
echo.
echo Option 3: Use Working Cart API
echo   - Folder: working-cart/
echo   - Same as Option 2
echo.
echo 🎯 RECOMMENDED: Option 1 (Backend Serverless)
echo.
echo See Backend/CART_FILES_CONSOLIDATED.md for details!
echo.
pause
