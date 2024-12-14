#!/usr/bin/env zx

// Начало настройки сервера с Apache2
echo(chalk.green('Started Setup server'))

// Шаг 1 - Установка Apache2
echo(chalk.blue('#Step 1 - Installing Apache2'))
await $`sudo apt update`
await $`sudo apt install apache2`

// Шаг 2 - Настройка Firewall
echo(chalk.blue('#Step 2: Adjusting the Firewall'))
await $`sudo ufw allow OpenSSH`
await $`sudo ufw allow 'Apache Full'`
await $`sudo ufw enable`
await $`sudo ufw status`

// Шаг 3 - Установка PHP
echo(chalk.blue('#Step 3 - Install PHP'))
await $`sudo apt install php8.1 libapache2-mod-php8.1 php8.1-mysql`
await $`sudo apt install php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml php8.1-intl php8.1-gd php8.1-curl php8.1-zip php8.1-gmp`

// Установка Composer
await $`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"`
await $`php -r "if (hash_file('sha384', 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"`
await $`php composer-setup.php`
await $`php -r "unlink('composer-setup.php');"`
await $`sudo mv composer.phar /usr/bin/composer`

// Шаг 4 - Установка MySQL
echo(chalk.blue('#Step 4 - Install MySQL'))
await $`sudo apt install mysql-server`

// Шаг 5 - Настройка виртуального хоста
echo(chalk.blue('#Step 5 - Setting Up VirtualHost'))

let domainName = await question('What is your domain name? ')
echo(chalk.green(`Your domain name is: ${domainName} \n`))

await $`sudo mkdir -p /var/www/Ganjamill`
await $`sudo chown -R $USER:$USER /var/www/Ganjamill`

await $`sudo touch /etc/apache2/sites-available/${domainName}.conf`

await $`sudo chmod 777 /etc/apache2/sites-available/${domainName}.conf`

await $`sudo echo '<VirtualHost *:80>
    ServerName ${domainName}
    ServerAlias www.${domainName}
    DocumentRoot /var/www/Ganjamill

    <Directory /var/www/Ganjamill>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>' > /etc/apache2/sites-available/${domainName}.conf`

await $`sudo a2ensite ${domainName}.conf`
await $`sudo a2enmod rewrite`
await $`sudo systemctl reload apache2`

// Шаг 6 - Настройка HTTPS с помощью Let's Encrypt
echo(chalk.blue('Securing Apache with Let\'s Encrypt'))
await $`sudo apt install certbot python3-certbot-apache`
await $`sudo certbot --apache -d ${domainName} -d www.${domainName}`

echo(chalk.green('Apache Setup success!'))