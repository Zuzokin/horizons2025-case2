# Скрипт для создания администратора системы (PowerShell)
# Используется для локальной разработки

param(
    [string]$AdminEmail = "admin@horizons.local",
    [string]$AdminPassword = "admin123",
    [string]$AdminFirstName = "System",
    [string]$AdminLastName = "Administrator",
    [string]$DatabaseUrl = "postgresql://horizons_user:horizons_password@localhost:5432/horizons_db"
)

Write-Host "Creating admin user..." -ForegroundColor Green
Write-Host "Email: $AdminEmail" -ForegroundColor Yellow
Write-Host "Password: $AdminPassword" -ForegroundColor Yellow

# Устанавливаем переменные окружения
$env:ADMIN_EMAIL = $AdminEmail
$env:ADMIN_PASSWORD = $AdminPassword
$env:ADMIN_FIRST_NAME = $AdminFirstName
$env:ADMIN_LAST_NAME = $AdminLastName
$env:DATABASE_URL = $DatabaseUrl

# Запускаем Python скрипт
python scripts/create_admin.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "Admin user created successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to create admin user!" -ForegroundColor Red
    exit 1
}
