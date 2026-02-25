# Скрипт для локального запуска Enchanted Paws Grove

Write-Host "🌿 Запуск Enchanted Paws Grove локально..." -ForegroundColor Green
Write-Host ""

# Проверка Python
Write-Host "Проверка Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python не найден! Установите Python 3.9+" -ForegroundColor Red
    exit 1
}

# Проверка Node.js
Write-Host "Проверка Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js не найден! Установите Node.js 16+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "📦 Установка зависимостей бэкенда..." -ForegroundColor Yellow
Set-Location backend
python -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка установки зависимостей бэкенда" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Зависимости бэкенда установлены" -ForegroundColor Green

# Frontend
Write-Host "📦 Установка зависимостей фронтенда..." -ForegroundColor Yellow
Set-Location ../frontend
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка установки зависимостей фронтенда" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Зависимости фронтенда установлены" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Запуск серверов..." -ForegroundColor Green
Write-Host ""
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "   API Docs: http://localhost:8000/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Нажмите Ctrl+C чтобы остановить серверы" -ForegroundColor Yellow
Write-Host ""

# Запуск бэкенда в фоне
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    python -m uvicorn app.main:app --reload --port 8000
}

# Небольшая задержка для запуска бэкенда
Start-Sleep -Seconds 3

# Запуск фронтенда в фоне
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}

# Показываем логи обоих серверов
Write-Host "Логи бэкенда:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    while ($true) {
        # Показываем логи бэкенда
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            $backendOutput | ForEach-Object { Write-Host $_ -ForegroundColor White }
        }

        # Показываем логи фронтенда
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object { Write-Host $_ -ForegroundColor Cyan }
        }

        Start-Sleep -Milliseconds 500

        # Проверяем, что оба джоба еще работают
        if ($backendJob.State -eq 'Failed' -or $frontendJob.State -eq 'Failed') {
            Write-Host "✗ Один из серверов упал" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "Остановка серверов..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "✓ Серверы остановлены" -ForegroundColor Green
}
