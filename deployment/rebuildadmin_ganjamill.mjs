#!/usr/bin/env zx

// Функция для очистки директорий
const cleanDirectories = async (path) => {
    console.log(chalk.blue(`Cleaning directories for ${path}...`));
    await $`rm -rf ${path}/node_modules`;
    await $`rm -rf ${path}/.next`;
};

// Функция для установки зависимостей и сборки проекта
const buildAdmin = async (path, buildScript) => {
    console.log(chalk.blue(`Installing dependencies...`));
    await $`yarn --cwd ${path}`;

    console.log(chalk.blue(`Building the project with ${buildScript}...`));
    await $`yarn --cwd ${path} ${buildScript}`;
};

// Основная логика
const rebuildAdmin = async () => {
    console.log(chalk.blue("Starting Admin project build..."));

    const buildOptions = { '1': 'build:rest', '2': 'build:gql' };

    let whichConfig;
    do {
        whichConfig = await question('What API do you want to use? Enter 1 for REST or 2 for GraphQL: ');
    } while (!['1', '2'].includes(whichConfig));

    const path = whichConfig === '1' ? './admin/rest' : './admin/graphql';
    const buildScript = buildOptions[whichConfig];

    try {
        // Очистка директорий
        await cleanDirectories(path);

        // Сборка проекта
        console.log(chalk.blue(`Building for ${whichConfig === '1' ? 'REST' : 'GraphQL'} API...`));
        await buildAdmin(path, buildScript);

        console.log(chalk.green('Admin project build completed successfully! 🎉'));
    } catch (error) {
        console.error(chalk.red("An error occurred during the build process:"), error);
        process.exit(1);
    }
};

// Запуск скрипта
await rebuildAdmin();
