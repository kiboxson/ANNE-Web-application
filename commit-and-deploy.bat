@echo off
cd /d "e:\final\project"
git add vercel.json FINAL_VERCEL_FIX.md
git commit -m "Fix-Vercel-deployment"
git push origin main
echo.
echo ========================================
echo   Code pushed to GitHub!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Find your backend project
echo 3. Go to Settings - General
echo 4. Check "Root Directory" setting:
echo    - If deploying whole repo: Leave EMPTY
echo    - If deploying backend only: Set to "Backend"
echo 5. Go to Deployments tab
echo 6. Redeploy latest (UNCHECK cache!)
echo 7. Wait for deployment
echo 8. Run: node test-vercel-endpoints.js
echo.
pause
