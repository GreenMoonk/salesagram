#!/usr/bin/env zx

console.log(chalk.blue('Admin project build'));

let whichConfig = await question('What API do you want to use? Enter 1 for REST API or 2 for GraphQL: ');

if (whichConfig == 1) {
    console.log("Remove node_modules folder");
    await $`rm -rf admin/rest/node_modules`;

    console.log("Remove .next folder");
    await $`rm -rf admin/rest/.next`;

    console.log('Install Node For admin');
    await $`yarn --cwd ./admin/rest`;

    console.log('Build REST admin');
    await $`yarn --cwd ./admin/rest build`;

    console.log("Remove node_modules folder");
    await $`rm -rf admin/rest/node_modules`;

    console.log(chalk.green('REST admin build completed successfully'));
} else {
    console.log("Remove node_modules folder");
    await $`rm -rf admin/graphql/node_modules`;

    console.log("Remove .next folder");
    await $`rm -rf admin/graphql/.next`;

    console.log('Install Node For admin');
    await $`yarn --cwd ./admin/graphql`;

    console.log('Build GraphQL admin');
    await $`yarn --cwd ./admin/graphql build`;

    console.log("Remove node_modules folder");
    await $`rm -rf admin/graphql/node_modules`;

    console.log(chalk.green('GraphQL admin build completed successfully'));
}
