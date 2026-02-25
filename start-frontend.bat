@echo off
echo.
echo ====================================
echo  Frontend - Enchanted Paws Grove
echo ====================================
echo.

cd /d "%~dp0\frontend"

echo Установка зависимостей...
call npm install --silent
if errorlevel 1 (
    echo Ошибка установки зависимостей!
    pause
    exit /b 1
)

echo.
echo Запуск фронтенда на http://localhost:5173
echo.
echo Нажмите Ctrl+C чтобы остановить
echo.

call npm run dev

pause
