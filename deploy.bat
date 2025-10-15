@echo off
echo Committing changes...
git commit -m "Fix backend deployment for Vercel"
echo Pushing to GitHub...
git push origin main
echo Done! Check Vercel for automatic redeployment.
pause
