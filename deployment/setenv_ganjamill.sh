#!/bin/bash

echo "Started Setup server"

# Шаг 1: Установка Apache2
echo "# Step 1 - Installing Apache2"
sudo apt update
sudo apt install -y apache2

# Шаг 2: Настройка Firewall
echo "# Step 2: Adjusting the Firewall"
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw --force enable
sudo ufw status

# Шаг 3: Установка PHP
echo "# Step 3 - Install PHP"
sudo apt install -y php8.1 libapache2-mod-php8.1 php8.1-mysql \
    php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml \
    php8.1-intl php8.1-gd php8.1-curl php8.1-zip php8.1-gmp

# Установка Composer
echo "Installing Composer"
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

# Шаг 4: Установка MySQL
echo "# Step 4 - Install MySQL"
sudo apt install -y mysql-server

# Шаг 5: Настройка виртуального хоста
echo "# Step 5 - Setting Up VirtualHost"
DOMAIN_NAME="ganjamill.io"
SECOND_DOMAIN="ganjamill.asia"

sudo mkdir -p /var/www/ganjamill
sudo chown -R $USER:$USER /var/www/ganjamill

# Создание файла конфигурации Apache
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

# Шаг 6: Настройка HTTPS с помощью Let's Encrypt
echo "Securing Apache with Let's Encrypt"
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d $DOMAIN_NAME -d www.$DOMAIN_NAME -d $SECOND_DOMAIN -d www.$SECOND_DOMAIN

echo "Apache Setup success!"
