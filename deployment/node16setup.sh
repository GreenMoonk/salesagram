#!/bin/sh
set -e

# Версия Node.js
NODE_VERSION="16.x"

# Функция для установки Node.js
install_nodejs() {
    if command -v node >/dev/null 2>&1; then
        echo "Node.js already installed. Skipping..."
    else
        echo "Installing Node.js (version $NODE_VERSION)..."
        curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
        sudo apt-get update
        sudo apt-get install -y nodejs
        echo "Node.js installed successfully."
    fi
}

# Функция для установки глобальных npm пакетов
install_global_npm_package() {
    PACKAGE_NAME=$1
    if npm list -g "$PACKAGE_NAME" >/dev/null 2>&1; then
        echo "$PACKAGE_NAME already installed globally. Skipping..."
    else
        echo "Installing $PACKAGE_NAME..."
        sudo npm install -g "$PACKAGE_NAME"
        echo "$PACKAGE_NAME installed successfully."
    fi
}

# Основные действия
echo "Updating system packages..."
sudo apt-get update

# Установка Node.js
install_nodejs

# Установка глобальных инструментов
install_global_npm_package "yarn"
install_global_npm_package "pm2"
install_global_npm_package "zx"

# Настройка PM2 для автозагрузки
echo "Configuring PM2 startup..."
sudo pm2 startup systemd

echo "==> Installation done. Please follow the next command as needed."