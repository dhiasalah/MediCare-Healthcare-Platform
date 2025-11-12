# Start both backend and frontend servers
Write-Host "Starting Medical Platform..." -ForegroundColor Green

# Start Backend
Write-Host "`nStarting Django Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\dhia2022-2023\web project m1\backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\dhia2022-2023\web project m1'; npm run dev"

Write-Host "`nServers are starting in separate windows..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
