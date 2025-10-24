@echo off
echo ========================================
echo   QUICK FIX - Use Minimal Cart Server
echo ========================================
echo.

cd /d "e:\final\project\Backend"

echo [1/5] Backing up current files...
if exist vercel.json (
    copy vercel.json vercel-old.json >nul
    echo   - Backed up vercel.json
)
if exist index.js (
    copy index.js index-old.js >nul
    echo   - Backed up index.js
)

echo [2/5] Activating minimal server...
copy vercel-minimal.json vercel.json >nul
copy server-minimal.js index.js >nul
echo   - Minimal server activated

cd ..

echo [3/5] Committing changes...
git add Backend/
git commit -m "Switch-to-minimal-cart-server"

echo [4/5] Pushing to GitHub...
git push origin main

echo [5/5] Done!
echo.
echo ========================================
echo   Deployment Triggered!
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://vercel.com/dashboard
echo 2. Wait for deployment to complete (2-3 min)
echo 3. Test: node test-cart-direct.js
echo 4. Should show: SUCCESS!
echo 5. Try Add to Cart in your app
echo.
echo If it works, cart is fixed! ✅
echo.
pause
