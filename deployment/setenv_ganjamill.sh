#!/bin/bash
set -e

echo "Started Setup server"

# Шаг 1: Настройка Firewall с разрешением SSH и Apache
echo "# Step 1: Adjusting the Firewall"
if ! sudo ufw status | grep -q "OpenSSH"; then
    echo "Allowing SSH access through the firewall..."
    sudo ufw allow OpenSSH
fi

if ! sudo ufw status | grep -q "Apache Full"; then
    echo "Allowing Apache Full (HTTP/HTTPS) through the firewall..."
    sudo ufw allow 'Apache Full'
fi

# Проверка статуса UFW и включение, если не включен
if ! sudo ufw status | grep -q "Status: active"; then
    echo "Enabling UFW..."
    sudo ufw --force enable
fi
sudo ufw status verbose

# Шаг 2: Установка PHP и необходимых модулей (если не установлено)
echo "# Step 2: Install PHP"
if ! php -v | grep -q "8.1"; then
    echo "Installing PHP 8.1 and required extensions..."
    sudo apt install -y php8.1 libapache2-mod-php8.1 php8.1-mysql \
        php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml \
        php8.1-intl php8.1-gd php8.1-curl php8.1-zip php8.1-gmp
else
    echo "PHP 8.1 is already installed. Skipping..."
fi

# Шаг 3: Установка Composer (если не установлен)
echo "Installing Composer..."
if ! command -v composer >/dev/null 2>&1; then
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    EXPECTED_SIGNATURE="$(wget -q -O - https://composer.github.io/installer.sig)"
    ACTUAL_SIGNATURE="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

    if [ "$EXPECTED_SIGNATURE" != "$ACTUAL_SIGNATURE" ]; then
        echo "ERROR: Invalid installer signature"
        rm composer-setup.php
        exit 1
    fi
    php composer-setup.php --quiet
    rm composer-setup.php
    sudo mv composer.phar /usr/bin/composer
    echo "Composer installed successfully."
else
    echo "Composer is already installed. Skipping..."
fi

# Шаг 4: Установка MySQL (если не установлен)
echo "# Step 4: Install MySQL"
if ! command -v mysql >/dev/null 2>&1; then
    echo "Installing MySQL server..."
    sudo apt install -y mysql-server
else
    echo "MySQL is already installed. Skipping..."
fi

# Шаг 5: Настройка виртуального хоста
echo "# Step 5: Setting Up VirtualHost"
DOMAIN_NAME="ganjamill.io"
SECOND_DOMAIN="ganjamill.asia"

if [ ! -f "/etc/apache2/sites-available/ganjamill.conf" ]; then
    echo "Creating VirtualHost configuration for Apache..."
    sudo mkdir -p /var/www/ganjamill
    sudo chown -R $USER:$USER /var/www/ganjamill

    sudo tee /etc/apache2/sites-available/ganjamill.conf > /dev/null <<EOL
<VirtualHost *:80>
    ServerName $DOMAIN_NAME
    ServerAlias www.$DOMAIN_NAME $SECOND_DOMAIN www.$SECOND_DOMAIN
    DocumentRoot /var/www/ganjamill

    <Directory /var/www/ganjamill>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/ganjamill_error.log
    CustomLog \${APACHE_LOG_DIR}/ganjamill_access.log combined
</VirtualHost>
EOL

    sudo a2ensite ganjamill.conf
    sudo a2enmod rewrite
    sudo systemctl reload apache2
else
    echo "VirtualHost configuration already exists. Skipping..."
fi

# Шаг 6: Настройка HTTPS с помощью Let's Encrypt
echo "Securing Apache with Let's Encrypt"
if ! command -v certbot >/dev/null 2>&1; then
    echo "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-apache
fi

echo "Running Certbot for SSL..."
sudo certbot --apache -d $DOMAIN_NAME -d www.$DOMAIN_NAME -d $SECOND_DOMAIN -d www.$SECOND_DOMAIN

echo "Apache Setup success!"