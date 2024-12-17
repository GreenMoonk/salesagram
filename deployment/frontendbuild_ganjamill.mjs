#!/usr/bin/env zx

const configureEnv = async (type, domainName) => {
    const apiEndpoint =
      type === "rest"
        ? `NEXT_PUBLIC_REST_API_ENDPOINT="https://${domainName}/backend"`
        : `NEXT_PUBLIC_GRAPHQL_API_ENDPOINT="https://${domainName}/backend/graphql"`;
    const adminUrl = `NEXT_PUBLIC_ADMIN_URL="https://${domainName}/admin"`;
    const framework = `FRAMEWORK_PROVIDER="${type}"`;
  
    await $`cp ./shop/.env.template ./shop/.env && chmod 644 ./shop/.env`;
    await $`awk -v api="${apiEndpoint}" -v admin="${adminUrl}" -v fw="${framework}" '{gsub(/NEXT_PUBLIC_.*_API_ENDPOINT=.*/, api); gsub(/NEXT_PUBLIC_ADMIN_URL=.*/, admin); gsub(/FRAMEWORK_PROVIDER=.*/, fw)} 1' ./shop/.env > ./shop/.env.tmp && mv ./shop/.env.tmp ./shop/.env`;
  
    const tsconfig = type === "rest" ? "tsconfig.rest.json" : "tsconfig.graphql.json";
    await $`cp ./shop/${tsconfig} ./shop/tsconfig.json`;
  
    const nextConfigSubDir = `domains: [ \`${domainName}\`,`;
    await $`awk -v sub="${nextConfigSubDir}" '{sub(/domains: \\[.*/, sub)} 1' ./shop/next.config.js > ./shop/next.config.tmp && mv ./shop/next.config.tmp ./shop/next.config.js`;
  };
  
  const buildFrontend = async (apiType) => {
    console.log(`Building for ${apiType.toUpperCase()} API...`);
    await $`yarn --cwd ./ build:shop-${apiType}`;
    await $`yarn --cwd ./ build:admin-${apiType}`;
  };
  
  console.log(chalk.blue('Frontend Project Build'));
  
  const domainName = await question('What is your domain name? ');
  console.log(chalk.green(`Your domain name is: ${domainName}`));
  
  const apiChoice = await question('Choose API: 1 for REST, 2 for GraphQL: ');
  const apiType = apiChoice === '1' ? 'rest' : 'graphql';
  
  try {
    console.log(chalk.blue('#Step 1 - Config Next Admin App'));
    await configureEnv(apiType, domainName);
  
    console.log(chalk.blue('#Step 2 - Install Frontend Dependencies'));
    await $`yarn`;
  
    console.log(chalk.blue('#Step 3 - Build Project'));
    await buildFrontend(apiType);
  
    console.log(chalk.blue('#Step 4 - Preparing for Upload'));
    await $`rm -rf shop/node_modules admin/rest/node_modules admin/graphql/node_modules ./node_modules`;
    await $`zip -r frontend.zip shop admin package.json babel.config.js yarn.lock`;
  
    console.log(chalk.green('frontend.zip file created'));
  
    const username = await question('Enter your server username (ex: ubuntu): ');
    const ipAddress = await question('Enter server IP address (ex: 11.111.111.11): ');
  
    console.log(chalk.blue('Uploading to server...'));
    await $`scp ./frontend.zip ${username}@${ipAddress}:/var/www/ganjamill`;
    await $`ssh -o StrictHostKeyChecking=no ${username}@${ipAddress} "unzip -o /var/www/ganjamill/frontend.zip -d /var/www/ganjamill"`;
  
    console.log(chalk.green('Your application build and upload were successful!'));
  } catch (error) {
    console.error(chalk.red('Error encountered:'), error);
  }  