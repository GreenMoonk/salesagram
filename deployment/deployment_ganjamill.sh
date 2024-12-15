#!/bin/bash

# Считываем данные о сервере
echo "Enter your server username (e.g., ubuntu):"
read username
echo "Enter server IP address (e.g., 11.111.111.11):"
read ip_address

# Подключение к серверу и создание нужных директорий
echo "########### Connecting to server... ###########"
ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" << EOF
  echo "Creating /var/www/ganjamill if not exists..."
  sudo mkdir -p /var/www/ganjamill
  sudo chown -R \$USER:\$USER /var/www/ganjamill

  echo "Checking and installing necessary tools (zip/unzip)..."
  if ! command -v zip &> /dev/null; then
      sudo apt install -y zip
  fi
  if ! command -v unzip &> /dev/null; then
      sudo apt install -y unzip
  fi
EOF

# Архивация локальных данных (api и deployment)
if [ -d "./api" ]; then
  echo "Zipping api folder..."
  zip -r -q ./api.zip ./api
else
  echo "API folder not found, skipping..."
fi

if [ -d "./deployment" ]; then
  echo "Zipping deployment folder..."
  zip -r -q ./deployment.zip ./deployment
else
  echo "Deployment folder not found, skipping..."
fi

# Проверяем, созданы ли zip-архивы, и отправляем их на сервер
if [ -f "./api.zip" ]; then
    echo "Uploading api
