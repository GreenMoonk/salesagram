#!/usr/bin/env zx

echo(chalk.blue('#Step 1 - Database creation'))

// Ввод имени БД
echo("Please enter the NAME of the new MySQL database! (example: pickbazar)")
let dbname = await question('Database name: ')

// Ввод кодировки
echo("Please enter the MySQL database CHARACTER SET! (example: utf8, latin1, ...)")
echo("Enter utf8 if you don't know what you are doing")
let charset = await question('Charset name: ')

// Создание базы данных
echo("Creating new MySQL database...")
await $`sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${dbname} /*\!40100 DEFAULT CHARACTER SET ${charset} */;"`
echo(chalk.green("Database '${dbname}' successfully created!"))

// Показать существующие базы данных
echo("Showing existing databases...")
await $`sudo mysql -e "SHOW DATABASES;"`

// Ввод имени пользователя
echo("\nPlease enter the NAME of the new MySQL database user! (example: pickbazar_user)")
let username = await question('Database username: ')

// Ввод пароля
echo("Please enter the PASSWORD for the new MySQL database user!")
let userpass = await question('Database password: ')

// Проверка существования пользователя
echo("Creating new user...")
await $`sudo mysql -e "DROP USER IF EXISTS '${username}'@'%';"`
await $`sudo mysql -e "CREATE USER '${username}'@'%' IDENTIFIED BY '${userpass}';"`
echo(chalk.green("User '${username}' successfully created!"))

// Назначение привилегий
echo(`Granting ALL privileges on ${dbname} to ${username}...`)
await $`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'%';"`
await $`sudo mysql -e "FLUSH PRIVILEGES;"`
echo(chalk.green("Privileges granted to user '${username}'."))

// Настройка конфигурационного файла .env
echo(chalk.blue('#Step 2 - Setting Up API Project'))

let domainName = await question('What is your domain name? ')
echo(chalk.green(`Your domain name is ${domainName} \n`))

await $`sudo cp /var/www/ganjamill/api/.env.example /var/www/ganjamill/api/.env`
await $`sudo chmod 644 /var/www/ganjamill/api/.env`

// Заполнение переменных в .env
await $`sed -i 's|^DB_HOST=.*|DB_HOST=localhost|' /var/www/ganjamill/api/.env`
await $`sed -i 's|^DB_DATABASE=.*|DB_DATABASE=${dbname}|' /var/www/ganjamill/api/.env`
await $`sed -i 's|^DB_USERNAME=.*|DB_USERNAME=${username}|' /var/www/ganjamill/api/.env`
await $`sed -i 's|^DB_PASSWORD=.*|DB_PASSWORD=${userpass}|' /var/www/ganjamill/api/.env`
await $`sed -i 's|^APP_URL=.*|APP_URL=https://${domainName}/backend|' /var/www/ganjamill/api/.env`

echo('Installing dependencies...')
await $`composer install --working-dir /var/www/ganjamill/api`

echo('Generating application key...')
await $`php /var/www/ganjamill/api/artisan key:generate`

echo('Installing Marvel packages...')
await $`php /var/www/ganjamill/api/artisan marvel:install`

echo('Creating storage link...')
await $`php /var/www/ganjamill/api/artisan storage:link`

echo('Setting permissions...')
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/storage`
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/bootstrap/cache`

echo(chalk.green(`Congratulations! Your application is now running at https://${domainName}/backend`))