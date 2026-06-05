@echo off
REM Deploy script for Sales Dashboard - Supabase Migration
REM This script installs dependencies, builds the project, and pushes to GitHub

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Sales Dashboard - Deploy Script
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
echo.
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [2/5] Building project...
echo.
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build successful
echo.

echo [3/5] Staging changes...
echo.
git add -A
echo ✓ Changes staged
echo.

echo [4/5] Creating commit...
echo.
git commit -m "feat: complete lovable analysis and supabase integration with all 28 fields"
if errorlevel 1 (
    echo WARNING: Commit failed (possibly nothing to commit)
)
echo ✓ Commit created
echo.

echo [5/5] Pushing to GitHub...
echo.
git push origin main
if errorlevel 1 (
    echo ERROR: Push failed
    echo Please check your GitHub credentials and try again
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub
echo.

echo ========================================
echo ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Summary:
echo - Dependencies: INSTALLED
echo - Build: SUCCESSFUL
echo - Git Commit: COMPLETE
echo - GitHub Push: COMPLETE
echo.
echo Next steps:
echo 1. npm run dev          (to test locally)
echo 2. Visit http://localhost:3000
echo.
pause
