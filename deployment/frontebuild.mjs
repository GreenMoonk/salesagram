#!/usr/bin/env zx

console.log(chalk.blue('Front end project build'));

console.log(chalk.blue('#Step 1: Setting Up Project Configuration'));
let domainName = await question('What is your domain name? ');
console.log(chalk.green(`Your domain name is: ${domainName} \n`));

console.log(chalk.blue('#Step 2 - Config Next Admin App For /admin Sub Directory'));
await $`cp admin/rest/next.config.js ./admin/rest/temp.js`;
await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ./admin/rest/temp.js > ./admin/rest/next.config.js`;
await $`rm -rf ./admin/rest/temp.js`;

await $`cp ./admin/graphql/next.config.js ./admin/graphql/temp.js`;
await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ./admin/graphql/temp.js > ./admin/graphql/next.config.js`;
await $`rm -rf ./admin/graphql/temp.js`;

console.log(chalk.blue('#Step 3 - Installing Frontend Project Dependencies'));
console.log('Please wait while the dependencies are being installed...');

await $`yarn`;

let whichConfig = await question('What API do you want to use? Enter 1 for REST API or 2 for GraphQL: ');
if (whichConfig == 1) {
    await $`rm -f ./shop/.env`;
    await $`cp ./shop/.env.template ./shop/.env`;
    await $`chmod 777 ./shop/.env`;
    await $`awk '{gsub(/NEXT_PUBLIC_REST_API_ENDPOINT=.\".+\"$/,"NEXT_PUBLIC_REST_API_ENDPOINT=\"https://${domainName}/backend\"");gsub(/NEXT_PUBLIC_ADMIN_URL=/,"NEXT_PUBLIC_ADMIN_URL=\"https://${domainName}/admin\""); print $0}' ./shop/.env.template > ./shop/.env`;
    await $`awk '{gsub(/FRAMEWORK_PROVIDER=.\".+\"$/,"FRAMEWORK_PROVIDER=\"rest\""); print $0}' ./shop/.env > ./shop/tmp && mv ./shop/tmp ./shop/.env && rm -rf ./shop/tmp`;

    await $`rm -f ./admin/rest/.env`;
    await $`cp ./admin/rest/.env.template ./admin/rest/.env`;
    await $`chmod 777 ./admin/rest/.env`;
    await $`awk '{gsub(/NEXT_PUBLIC_REST_API_ENDPOINT=.\".+\"$/,"NEXT_PUBLIC_REST_API_ENDPOINT=\"https://${domainName}/backend\"");gsub(/NEXT_PUBLIC_SHOP_URL="http:\/\/localhost:3003"/,"NEXT_PUBLIC_SHOP_URL=\"https://${domainName}\""); print $0}' ./admin/rest/.env.template > ./admin/rest/.env`;

    await $`cp ./shop/tsconfig.rest.json ./shop/tsconfig.json`;
} else {
    await $`rm -f ./shop/.env`;
    await $`cp ./shop/.env.template ./shop/.env`;
    await $`chmod 777 ./shop/.env`;
    await $`awk '{gsub(/NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=.\".+\"$/,"NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=\"https://${domainName}/backend/graphql\""); gsub(/NEXT_PUBLIC_ADMIN_URL=/,"NEXT_PUBLIC_ADMIN_URL=\"https://${domainName}/admin\""); print $0}' ./shop/.env.template > ./shop/.env`;
    await $`awk '{gsub(/FRAMEWORK_PROVIDER=.\".+\"$/,"FRAMEWORK_PROVIDER=\"graphql\""); print $0}' ./shop/.env > ./shop/tmp && mv ./shop/tmp ./shop/.env && rm -rf ./shop/tmp`;

    await $`rm -f ./admin/graphql/.env`;
    await $`cp ./admin/graphql/.env.template ./admin/graphql/.env`;
    await $`chmod 777 ./admin/graphql/.env`;
    await $`awk '{gsub(/NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=.\".+\"$/,"NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=\"https://${domainName}/backend/graphql\""); gsub(/NEXT_PUBLIC_SHOP_URL="http:\/\/localhost:3001"/,"NEXT_PUBLIC_SHOP_URL=\"https://${domainName}\""); print $0}' ./admin/graphql/.env.template > ./admin/graphql/.env`;
    await $`awk '{gsub(/NEXT_PUBLIC_API_ROOT=.\".+\"$/,"NEXT_PUBLIC_API_ROOT=\"https://${domainName}/backend\""); print $0}' ./admin/graphql/.env > ./admin/graphql/tmp && mv ./admin/graphql/tmp ./admin/graphql/.env && rm -rf ./admin/graphql/tmp`;

    await $`cp ./shop/tsconfig.graphql.json ./shop/tsconfig.json`;
}

if (whichConfig == 1) {
    console.log('Building for REST API');
    await $`yarn build:shop-rest`;
    await $`yarn build:admin-rest`;
} else {
    console.log('Building for GraphQL API');
    await $`yarn build:shop-gql`;
    await $`yarn build:admin-gql`;
}

console.log(chalk.green('Build process completed successfully!'));
