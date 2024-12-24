#!/usr/bin/env zx

console.log(chalk.blue('Shop project build'));

if ("./shop.zip") {
    await $`rm -rf shop.zip`;
}

console.log("Remove node_modules folder");
await $`rm -rf shop/node_modules`;

console.log("Remove .next folder");
await $`rm -rf shop/.next`;

console.log('Install Node For shop');
await $`yarn --cwd ./shop`;

let whichConfig = await question('What API do you want to use? Enter 1 for REST API or 2 for GraphQL: ');

if (whichConfig == 1) {
    console.log('Build REST shop');
    await $`yarn --cwd ./shop build:rest`;
} else {
    console.log('Build GraphQL shop');
    await $`yarn --cwd ./shop build:gql`;
}

console.log(chalk.green('Shop project build completed successfully'));
