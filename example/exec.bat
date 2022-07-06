@echo off
echo 1 - Smoke Test
echo 2 - Load Test
echo 3 - Stress Test
echo 4 - Soak Test

choice /C 1234 /M "Which test do you want to execute: "
if %errorlevel% == 4 goto Soak
if %errorlevel% == 3 goto Stress
if %errorlevel% == 2 goto Load
if %errorlevel% == 1 goto Smoke

:Smoke
    echo Execute Smoke Test
    call :ExecTest smokeTest
    exit

:Load
    echo Execute Load Test
    call :ExecTest loadTest
    exit

:Stress
    echo Execute Stress Test
    call :ExecTest stressTest
    exit

:Soak
    echo Execute Soak Test
    call :ExecTest soakTest
    exit

:ExecTest
    ..\tool\k6-ex.exe run --out json=.\data\points.json .\test\%1.js
    start .\report\test-report.html
    echo .
    pause
