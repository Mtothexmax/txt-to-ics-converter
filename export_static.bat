@echo off
cd converter
call npm run build
cd ..
echo Copying build artifacts to docs...
if not exist "docs" mkdir "docs"
xcopy /E /I /Y "converter\build" "docs"
echo Export complete. Check the 'docs' directory.
pause