# PowerShell script to start FastAPI backend and Next.js frontend
# Running from the 'scripts' folder

# Start FastAPI backend
Write-Host "Starting FastAPI backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\src; python main.py"

# Start Next.js frontend
Write-Host "Starting Next.js frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd genai-bot; npm run dev"

# Keep the PowerShell window open
Read-Host "Press Enter to close this window..."
