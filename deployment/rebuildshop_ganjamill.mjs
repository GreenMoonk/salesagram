#!/usr/bin/env zx

// Функция для очистки директорий
const cleanDirectories = async (path) => {
    console.log(chalk.blue(`Cleaning directories for ${path}...`));
    await $`rm -rf ${path}/node_modules`;
    await $`rm -rf ${path}/.next`;
};

// Функция для установки зависимостей и сборки проекта
const buildShop = async (path, buildScript) => {
    console.log(chalk.blue(`Installing dependencies...`));
    await $`yarn --cwd ${path}`;

    console.log(chalk.blue(`Building the project with ${buildScript}...`));
    await $`yarn --cwd ${path} ${buildScript}`;
};

// Основная логика
const rebuildShop = async () => {
    console.log(chalk.blue("Starting Shop project build..."));

    const shopPath = "./shop";
    const buildOptions = { '1': 'build:rest', '2': 'build:gql' };

    try {
        // Очистка директорий
        await cleanDirectories(shopPath);

        // Выбор типа API
        let whichConfig;
        do {
            whichConfig = await question('What API do you want to use? Enter 1 for REST or 2 for GraphQL: ');
        } while (!['1', '2'].includes(whichConfig));

        const buildScript = buildOptions[whichConfig];
        console.log(chalk.blue(`Building for ${whichConfig === '1' ? 'REST' : 'GraphQL'} API...`));

        // Установка зависимостей и сборка
        await buildShop(shopPath, buildScript);

        console.log(chalk.green('Project build completed successfully! 🎉'));
    } catch (error) {
        console.error(chalk.red("An error occurred during the build process:"), error);
        process.exit(1);
    }
};

// Запуск скрипта
await rebuildShop();