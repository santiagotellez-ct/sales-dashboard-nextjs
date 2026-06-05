# Deploy script for Sales Dashboard - Supabase Migration
# This PowerShell script installs dependencies, builds, and pushes to GitHub

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sales Dashboard - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Please run this script from the project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Install dependencies
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host ""
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Build project
Write-Host "[2/5] Building project..." -ForegroundColor Yellow
Write-Host ""
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Step 3: Stage changes
Write-Host "[3/5] Staging changes..." -ForegroundColor Yellow
Write-Host ""
git add -A
Write-Host "✓ Changes staged" -ForegroundColor Green
Write-Host ""

# Step 4: Create commit
Write-Host "[4/5] Creating commit..." -ForegroundColor Yellow
Write-Host ""
git commit -m "feat: complete lovable analysis and supabase integration with all 28 fields"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Commit failed (possibly nothing to commit)" -ForegroundColor Yellow
}
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

# Step 5: Push to GitHub
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed" -ForegroundColor Red
    Write-Host "Please check your GitHub credentials and try again" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Dependencies: INSTALLED" -ForegroundColor Green
Write-Host "  - Build: SUCCESSFUL" -ForegroundColor Green
Write-Host "  - Git Commit: COMPLETE" -ForegroundColor Green
Write-Host "  - GitHub Push: COMPLETE" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. npm run dev          (to test locally)"
Write-Host "  2. Visit http://localhost:3000"
Write-Host ""

Read-Host "Press Enter to exit"
