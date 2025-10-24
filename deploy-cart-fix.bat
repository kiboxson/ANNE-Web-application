@echo off
echo ========================================
echo   Deploying Cart Fix to Vercel
echo ========================================
echo.

cd /d "e:\final\project"

echo [1/4] Adding files to git...
git add .

echo [2/4] Committing changes...
git commit -m "Deploy cart API fixes to Vercel"

echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Deployment Triggered!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Wait for deployment to complete (1-2 min)
echo 3. Set environment variables:
echo    - MONGODB_URI
echo    - NODE_ENV
echo    - FRONTEND_URL
echo 4. Redeploy after setting variables
echo.
echo Then test: https://anne-web-application.vercel.app/
echo Should show version 1.0.3
echo.
pause
