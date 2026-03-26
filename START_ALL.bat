@echo off
title AcadChain Full Stack Starter
color 0A

echo.
echo  ====================================================
echo   AcadChain - Starting All Services
echo  ====================================================
echo.

:: Step 0: Kill existing Node processes to clear ports and prevent errors
echo [0/6] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Step 1: Start Blockchain Node
echo [1/6] Starting Local Blockchain (Hardhat)...
cd /d "d:\MERN Stack\mini project\blockchain"
start "Hardhat Node" cmd /k "npx hardhat node"
timeout /t 5 /nobreak >nul

:: Step 1: Deploy Contract
echo [1/5] Deploying Smart Contract...
cd /d "d:\MERN Stack\mini project\blockchain"
start "Contract Deployer" /wait cmd /c "npx hardhat run scripts/deploy.js --network localhost && pause"

:: Step 2: Start MongoDB Service
echo.
echo [2/5] Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo  OK MongoDB started as Windows service.
) else (
    echo  INFO MongoDB may already be running, or start it manually.
)

timeout /t 2 /nobreak >nul

:: Step 3: Seed the certificates
echo.
echo [3/5] Adding fake certificates to DB...
cd /d "d:\MERN Stack\mini project\server"
start "Certificate Seeder" /wait cmd /c "node seed_dummy_data.js && echo. && echo DONE - Certificates Added! && pause"

:: Step 4: Start Backend Server
echo.
echo [4/5] Starting Backend Server (port 5000)...
cd /d "d:\MERN Stack\mini project\server"
start "Backend Server" cmd /k "node index.js"

timeout /t 3 /nobreak >nul

:: Step 5: Start Frontend Dev Server
echo.
echo [5/5] Starting Frontend (port 5173)...
cd /d "d:\MERN Stack\mini project\client"
start "Frontend Vite" cmd /k "npm run dev"

echo.
echo  ====================================================
echo   All services are starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Blockchain: http://127.0.0.1:8545
echo   Login:    student@example.com / password123
echo  ====================================================
echo.
pause
