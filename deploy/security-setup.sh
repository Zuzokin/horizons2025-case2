вц#!/bin/bash
# Скрипт базовой настройки безопасности для Linux сервера
# Запускать от root пользователя

set -e

echo "🔒 Настройка базовой безопасности сервера..."

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Установка базовых пакетов безопасности
echo "🛡️ Установка пакетов безопасности..."
apt install -y ufw fail2ban unattended-upgrades htop curl wget git

# Настройка firewall
echo "🔥 Настройка UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Разрешаем SSH (измените порт если нужно)
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Включаем firewall
ufw --force enable

# Настройка fail2ban
echo "🚫 Настройка fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Настройка автоматических обновлений безопасности
echo "🔄 Настройка автоматических обновлений..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";' > /etc/apt/apt.conf.d/20auto-upgrades

# Создание пользователя для приложения
echo "👤 Создание пользователя для приложения..."
useradd -m -s /bin/bash horizons
usermod -aG docker horizons

# Настройка SSH (базовая безопасность)
echo "🔐 Настройка SSH..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Перезапуск SSH
systemctl restart sshd

echo "✅ Базовая настройка безопасности завершена!"
echo "⚠️  ВАЖНО: Убедитесь что у вас есть SSH ключ для доступа!"
echo "⚠️  ВАЖНО: Root доступ отключен, используйте пользователя 'horizons'"
