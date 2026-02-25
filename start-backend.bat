@echo off
echo.
echo ====================================
echo   Backend - Enchanted Paws Grove
echo ====================================
echo.

cd /d "%~dp0\backend"

echo Установка зависимостей...
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo Ошибка установки зависимостей!
    pause
    exit /b 1
)

echo.
echo Запуск бэкенда на http://localhost:8000
echo API Docs: http://localhost:8000/api/docs
echo.
echo Нажмите Ctrl+C чтобы остановить
echo.

python -m uvicorn app.main:app --reload --port 8000

pause
