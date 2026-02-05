# PowerShell script to clear Next.js/Turbopack cache
Write-Host "Clearing Next.js/Turbopack cache..." -ForegroundColor Yellow

# Stop any running Next.js processes
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Remove .next directory if it exists
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Deleted .next directory" -ForegroundColor Green
} else {
    Write-Host "✓ .next directory does not exist (cache is in-memory)" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Deleted node_modules/.cache" -ForegroundColor Green
}

Write-Host "`nCache cleared! Now restart your dev server with: npm run dev" -ForegroundColor Cyan
