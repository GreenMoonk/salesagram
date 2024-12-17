#!/usr/bin/env zx
echo(chalk.blue('# Step 1 - Installing Frontend Project Dependencies'));
console.log('Please wait while dependencies are being installed...');

try {
    await $`yarn --cwd /var/www/ganjamill/`;
    console.log(chalk.green('Dependencies installed successfully!\n'));
} catch (error) {
    console.error(chalk.red('Failed to install dependencies. Check your yarn setup!'));
    process.exit(1);
}

const startPM2Process = async (name, script) => {
    try {
        console.log(chalk.blue(`Starting ${name} with PM2...`));
        await $`pm2 --name ${name} start yarn --cwd /var/www/ganjamill -- run ${script}`;
        console.log(chalk.green(`${name} started successfully!\n`));
    } catch (error) {
        console.error(chalk.red(`Failed to start ${name}. Check PM2 logs for details.`));
        process.exit(1);
    }
};

const validConfigOptions = ['1', '2'];
let whichConfig;
do {
    whichConfig = await question('What do you want to use for frontend? Enter 1 for REST or 2 for GraphQL: ');
} while (!validConfigOptions.includes(whichConfig));

if (whichConfig === '1') {
    await startPM2Process('shop-rest', 'start:shop-rest');
    await startPM2Process('admin-rest', 'start:admin-rest');
} else {
    await startPM2Process('shop-gql', 'start:shop-gql');
    await startPM2Process('admin-gql', 'start:admin-gql');
}

console.log(chalk.green('All selected processes are running successfully! 🎉'));