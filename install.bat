where yarn >nul 2>nul
if %ERRORLEVEL% equ 9009 (
  echo Yarn not found. Installing...
  npm install -g yarn
) else (
  echo Yarn found.
)
if not exist node_modules (
  yarn install
)
npm i typescript -g
pause