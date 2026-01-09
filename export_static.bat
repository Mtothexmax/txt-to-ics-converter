@echo off
setlocal

echo Closing any potential Node processes...
taskkill /F /IM node.exe /T 2>nul

cd converter
echo.
echo Cleaning previous build...
if exist "build" (
    rmdir /s /q "build"
    if exist "build" (
        echo ERROR: Could not remove 'converter/build'. Please close any programs using this folder.
        pause
        exit /b 1
    )
)

echo.
echo Running build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed. See output above.
    pause
    exit /b 1
)

cd ..
echo.
echo Copying build artifacts to docs...
if not exist "docs" mkdir "docs"
xcopy /E /I /Y "converter\build" "docs"

echo.
echo Export complete. Check the 'docs' directory.
pause
