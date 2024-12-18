#!/usr/bin/env zx

console.log(chalk.blue('#Step 1 - Database creation'));

console.log("Please enter the NAME of the new MySQL database! (example: pickbazar)");
let dbname = await question('database name: ');

console.log("Please enter the MySQL database CHARACTER SET! (example: latin1, utf8, ...)");
console.log("Enter utf8 if you don't know what you are doing");
let charset = await question('charset name: ');

console.log("Creating new MySQL database...");
await $`sudo mysql -e "CREATE DATABASE ${dbname} /*\!40100 DEFAULT CHARACTER SET ${charset} */;"`;
console.log("Database successfully created!");

console.log("Showing existing databases...");
await $`sudo mysql -e "show databases;"`;

console.log("\nPlease enter the NAME of the new MySQL database user! (example: pickbazar_user)");
let username = await question('database username: ');

console.log("Please enter the PASSWORD for the new MySQL database user!");
let userpass = await question('database password: ');

console.log("Creating new user...");
await $`sudo mysql -e "CREATE USER ${username}@'%' IDENTIFIED BY '${userpass}';"`;
console.log("User successfully created!\n");

console.log("Granting ALL privileges on ${dbname} to ${username}!");
await $`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'%';"`;
await $`sudo mysql -e "FLUSH PRIVILEGES;"`;
console.log(chalk.green("You're good now :)"));

console.log(chalk.blue('#Step 2 - Configuring API project'));
let domainName = await question('What is your domain name? ');
console.log(chalk.green(`Your domain name is ${domainName} \n`));

await $`sudo rm -f /var/www/ganjamill/api/.env`;
await $`sudo cp /var/www/ganjamill/api/.env.example /var/www/ganjamill/api/.env`;
await $`sudo chmod 777 /var/www/ganjamill/api/.env`;

await $`awk '{gsub(/APP_URL=http:\/\/localhost/,"APP_URL=https://${domainName}/backend"); print $0}' /var/www/ganjamill/api/.env.example > /var/www/ganjamill/api/.env`;

await $`sed -ie 's/^DB_HOST=.*/DB_HOST=localhost/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_DATABASE=.*/DB_DATABASE=${dbname}/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_USERNAME=.*/DB_USERNAME=${username}/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_PASSWORD=.*/DB_PASSWORD=${userpass}/' /var/www/ganjamill/api/.env`;

console.log('Please be patient, project dependencies are downloading...');
await $`composer install --working-dir /var/www/ganjamill/api`;
console.log(chalk.green('Successfully downloaded dependencies \n'));

console.log('Generating application key');
await $`php /var/www/ganjamill/api/artisan key:generate`;

console.log('Installing marvel packages...');
await $`php /var/www/ganjamill/api/artisan marvel:install`;

console.log('Adding storage link...');
await $`php /var/www/ganjamill/api/artisan storage:link`;

console.log('Setting permissions for the project');
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/storage`;
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/bootstrap/cache`;

console.log(chalk.green('Congratulations! Your application is now configured and ready to run on YOUR_DOMAIN'));
