#!/usr/bin/env zx

// Автоматизация настройки сервера с использованием Apache2

const fs = require('fs');

console.log(chalk.green('Начало настройки сервера'));

// Шаг 1: Установка PHP и зависимостей
console.log(chalk.blue('#Step 1 - Установка PHP'));
await $`sudo apt update`;
await $`sudo add-apt-repository ppa:ondrej/php`;
await $`sudo apt update`;
await $`sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml php8.1-intl php8.1-gd php8.1-curl php8.1-zip php8.1-gmp`;

// Установка Composer
console.log('Установка Composer');
await $`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"`;
await $`php -r "if (hash_file('sha384', 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"`;
await $`php composer-setup.php`;
await $`php -r "unlink('composer-setup.php');"`;
await $`sudo mv composer.phar /usr/bin/composer`;

// Шаг 2: Установка MySQL
console.log(chalk.blue('#Step 2 - Установка MySQL'));
await $`sudo apt install mysql-server`;

// Шаг 3: Настройка виртуального хоста для Apache
console.log(chalk.blue('#Step 3: Настройка Apache для доменов ganjamill.io и ganjamill.asia'));

let domainName = await question('Введите имя домена (например, ganjamill.io): ');
let configPath = `/etc/apache2/sites-available/${domainName}.conf`;

// Проверка существующей конфигурации
if (fs.existsSync(configPath)) {
    let overwrite = await question(`Конфигурация для ${domainName} уже существует. Перезаписать настройки? (yes/no): `);
    if (overwrite.toLowerCase() !== 'yes') {
        console.log(chalk.yellow('Пропуск настройки виртуального хоста.'));
    } else {
        console.log(chalk.blue(`Перезапись конфигурации для ${domainName}.`));
    }
} else {
    console.log(chalk.blue('Создание новой конфигурации для виртуального хоста.'));
}

let whichConfig = await question('Какой API вы хотите использовать? Введите 1 для REST API или 2 для GraphQL: ');

let apacheConfig = `
<VirtualHost *:80>
    ServerName ${domainName}
    ServerAlias www.${domainName}

    DocumentRoot /var/www/ganjamill/${whichConfig == 1 ? "api" : "shop"}

    <Directory /var/www/ganjamill/${whichConfig == 1 ? "api" : "shop"}>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/${domainName}_error.log
    CustomLog \${APACHE_LOG_DIR}/${domainName}_access.log combined

    <IfModule mod_ssl.c>
        RewriteEngine On
        RewriteCond %{HTTPS} !=on
        RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L]
    </IfModule>
</VirtualHost>

<VirtualHost *:443>
    ServerName ${domainName}
    ServerAlias www.${domainName}

    DocumentRoot /var/www/ganjamill/${whichConfig == 1 ? "api" : "shop"}

    <Directory /var/www/ganjamill/${whichConfig == 1 ? "api" : "shop"}>
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine On
    SSLCertificateFile /etc/letsencrypt/live/${domainName}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${domainName}/privkey.pem

    ErrorLog \${APACHE_LOG_DIR}/${domainName}_ssl_error.log
    CustomLog \${APACHE_LOG_DIR}/${domainName}_ssl_access.log combined
</VirtualHost>
`;

await $`echo '${apacheConfig}' | sudo tee ${configPath}`;

console.log('Активируем виртуальный хост и перезапускаем Apache');
await $`sudo a2ensite ${domainName}`;
await $`sudo systemctl reload apache2`;

// Шаг 4: Установка Let's Encrypt
console.log(chalk.blue('Настройка SSL для домена'));
await $`sudo apt install certbot python3-certbot-apache`;
await $`sudo certbot --apache -d ${domainName} -d www.${domainName}`;

console.log(chalk.green('Настройка завершена успешно!'));
