#!/usr/bin/env zx

const fs = require('fs');
const logStream = fs.createWriteStream('setup.log', { flags: 'a' });
const log = (message) => {
    console.log(message);
    logStream.write(`${new Date().toISOString()} - ${message}\n`);
};

log(chalk.blue('#Step 1 - Database creation'));

log("Please enter the NAME of the new MySQL database! (example: pickbazar)");
let dbname = await question('database name: ');

log("Please enter the MySQL database CHARACTER SET! (example: latin1, utf8, ...)");
log("Enter utf8 if you don't know what you are doing");
let charset = await question('charset name: ');

log("Creating new MySQL database...");
try {
    await $`sudo mysql -e "CREATE DATABASE ${dbname} /*\!40100 DEFAULT CHARACTER SET ${charset} */;"`;
    log("Database successfully created!");
} catch (error) {
    log(chalk.yellow(`Database ${dbname} already exists. Continuing...\n`));
}

log("Showing existing databases...");
await $`sudo mysql -e "show databases;"`;

log("\nPlease enter the NAME of the new MySQL database user! (example: pickbazar_user)");
let username = await question('database username: ');

log("Please enter the PASSWORD for the new MySQL database user!");
let userpass = await question('database password: ');

log("Creating new user...");
try {
    await $`sudo mysql -e "CREATE USER ${username}@'%' IDENTIFIED BY '${userpass}';"`;
    log("User successfully created!\n");
} catch (error) {
    log(chalk.yellow(`User ${username} already exists. Continuing...\n`));
}

log("Granting ALL privileges on ${dbname} to ${username}!");
await $`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'%';"`;
await $`sudo mysql -e "FLUSH PRIVILEGES;"`;
log(chalk.green("You're good now :)"));

log(chalk.blue('#Step 2 - Configuring API project'));
let domainName = await question('What is your domain name? ');
log(chalk.green(`Your domain name is ${domainName} \n`));

if (fs.existsSync('/var/www/ganjamill/api/.env')) {
    log("Removing existing .env file...");
    await $`sudo rm -f /var/www/ganjamill/api/.env`;
}
await $`sudo cp /var/www/ganjamill/api/.env.example /var/www/ganjamill/api/.env`;
await $`sudo chmod 640 /var/www/ganjamill/api/.env`;

await $`awk '{gsub(/APP_URL=http:\/\/localhost/,"APP_URL=https://${domainName}/backend"); print $0}' /var/www/ganjamill/api/.env.example > /var/www/ganjamill/api/.env`;

await $`sed -ie 's/^DB_HOST=.*/DB_HOST=localhost/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_DATABASE=.*/DB_DATABASE=${dbname}/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_USERNAME=.*/DB_USERNAME=${username}/' /var/www/ganjamill/api/.env`;
await $`sed -ie 's/^DB_PASSWORD=.*/DB_PASSWORD=${userpass}/' /var/www/ganjamill/api/.env`;

log('Please be patient, project dependencies are downloading...');
await $`composer install --working-dir /var/www/ganjamill/api`;
log(chalk.green('Successfully downloaded dependencies \n'));

log('Generating application key');
await $`php /var/www/ganjamill/api/artisan key:generate`;

log('Installing marvel packages...');
await $`php /var/www/ganjamill/api/artisan marvel:install`;

log('Adding storage link...');
await $`php /var/www/ganjamill/api/artisan storage:link`;

log('Setting permissions for the project');
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/storage`;
await $`sudo chown -R www-data:www-data /var/www/ganjamill/api/bootstrap/cache`;

log(chalk.green('Setup Complete!'));
log(`
Summary:
- Database: ${dbname}
- User: ${username}
- Domain: ${domainName}
- Project is now ready to run at: https://${domainName}/backend
`);
