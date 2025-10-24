@echo off
echo ========================================
echo   CONSOLIDATING ALL CART FILES
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/5] Moving root api/cart.js to Backend...
git add api/cart.js
git mv api/cart.js Backend/api/cart-root.js 2>nul || echo Already moved

echo [2/5] Moving cart-only files to Backend...
git add cart-only/
git add Backend/cart-only/

echo [3/5] Moving working-cart files to Backend...
git add working-cart/
git add Backend/working-cart/

echo [4/5] Creating consolidated cart documentation...
git add Backend/CART_FILES_CONSOLIDATED.md

echo [5/5] Committing all cart consolidation...
git commit -m "CONSOLIDATE-ALL-Move-api-cart-only-working-cart-to-Backend"

echo [6/6] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   ALL CART FILES CONSOLIDATED!
echo ========================================
echo.
echo Files moved to Backend:
echo ✅ api/cart.js → Backend/api/cart-root.js
echo ✅ cart-only/ → Backend/cart-only/
echo ✅ working-cart/ → Backend/working-cart/
echo ✅ All cart files now in Backend folder
echo.
pause
