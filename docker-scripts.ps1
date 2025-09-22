# PowerShell скрипт для управления Docker контейнерами

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("up", "down", "build", "logs", "dev-up", "dev-down", "restart", "frontend-only", "backend-only", "prod-up", "prod-down", "clean", "status")]
    [string]$Action
)

switch ($Action) {
    "up" {
        Write-Host "Запуск полного стека (PostgreSQL + Backend + Frontend)..." -ForegroundColor Green
        docker compose up -d
        Write-Host "Стек запущен!" -ForegroundColor Yellow
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    }
    
    "down" {
        Write-Host "Остановка полного стека..." -ForegroundColor Red
        docker compose down
    }
    
    "build" {
        Write-Host "Пересборка приложения..." -ForegroundColor Blue
        docker compose build --no-cache app
        Write-Host "Приложение пересобрано!" -ForegroundColor Yellow
    }
    
    "logs" {
        Write-Host "Просмотр логов..." -ForegroundColor Cyan
        docker compose logs -f
    }
    
    "dev-up" {
        Write-Host "Запуск только PostgreSQL для разработки..." -ForegroundColor Green
        docker compose -f docker-compose.dev.yml up -d
        Write-Host "PostgreSQL запущен! Подключение: localhost:5432" -ForegroundColor Yellow
    }
    
    "dev-down" {
        Write-Host "Остановка PostgreSQL для разработки..." -ForegroundColor Red
        docker compose -f docker-compose.dev.yml down
    }
    
    "restart" {
        Write-Host "Перезапуск приложения..." -ForegroundColor Blue
        docker compose restart app
    }
    
    "frontend-only" {
        Write-Host "Запуск только фронтенда..." -ForegroundColor Green
        docker compose up -d frontend
        Write-Host "Frontend запущен! http://localhost:3000" -ForegroundColor Yellow
    }
    
    "backend-only" {
        Write-Host "Запуск только бэкенда (PostgreSQL + API)..." -ForegroundColor Green
        docker compose up -d postgres app
        Write-Host "Backend запущен! API: http://localhost:8000" -ForegroundColor Yellow
    }
    
    "prod-up" {
        Write-Host "Запуск продакшен стека..." -ForegroundColor Green
        docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        Write-Host "Продакшен стек запущен!" -ForegroundColor Yellow
    }
    
    "prod-down" {
        Write-Host "Остановка продакшен стека..." -ForegroundColor Red
        docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    }
    
    "clean" {
        Write-Host "Очистка Docker ресурсов..." -ForegroundColor Yellow
        docker compose down -v
        docker system prune -f
        Write-Host "Очистка завершена!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "Статус контейнеров:" -ForegroundColor Magenta
        docker compose ps
        Write-Host "`nИспользование ресурсов:" -ForegroundColor Magenta
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    }
}

# Показать статус контейнеров
Write-Host "`nСтатус контейнеров:" -ForegroundColor Magenta
docker ps --filter "name=horizons"
