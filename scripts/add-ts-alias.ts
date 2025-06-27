#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function addAliasToViteConfig (alias: string, path: string): void {
  const viteConfigPath = resolve(process.cwd(), 'vite.config.ts');
  let viteConfig = readFileSync(viteConfigPath, 'utf-8');

  // Ensure alias does not end with /*
  const aliasName = alias.replace(/\/\*$/, '');
  // Remove trailing /* from path if present
  const cleanPath = path.replace(/\/\*$/, '');

  // Check if alias already exists
  const aliasRegex = new RegExp(`['"]${aliasName}['"]: resolve(__dirname, ['"][^'"]+['"])`);
  if (aliasRegex.test(viteConfig)) {
    console.log(`Alias ${aliasName} already exists in vite.config.ts`);
    return;
  }

  // Find the alias object in the resolve.alias section
  const aliasObjectRegex = /resolve:\s*{\s*alias:\s*{([^}]+)}/;
  const match = viteConfig.match(aliasObjectRegex);

  if (!match) {
    throw new Error('Could not find resolve.alias section in vite.config.ts');
  }

  // Add the new alias
  const newAliasEntry = `      '${aliasName}': resolve(__dirname, '${cleanPath}'),`;
  const updatedAliasObject = match[1] + '\n' + newAliasEntry;

  viteConfig = viteConfig.replace(aliasObjectRegex, `resolve: {
    alias: {${updatedAliasObject}
    }`);

  writeFileSync(viteConfigPath, viteConfig, 'utf-8');
  console.log(`Added alias ${aliasName} -> ${cleanPath} to vite.config.ts`);
}

function addAliasToTsConfig (alias: string, path: string): void {
  const tsConfigPath = resolve(process.cwd(), 'tsconfig.json');
  const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));

  // Ensure alias ends with /* for TSConfig
  const aliasName = alias.replace(/\/\*$/, '') + '/*';
  // Ensure path ends with /*
  const tsPath = path.replace(/\/\*$/, '') + '/*';

  // Check if alias already exists
  if (tsConfig.compilerOptions.paths && tsConfig.compilerOptions.paths[aliasName]) {
    console.log(`Alias ${aliasName} already exists in tsconfig.json`);
    return;
  }

  // Initialize paths if it doesn't exist
  if (!tsConfig.compilerOptions.paths) {
    tsConfig.compilerOptions.paths = {};
  }

  // Add the new alias
  tsConfig.compilerOptions.paths[aliasName] = [tsPath];

  writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), 'utf-8');
  console.log(`Added alias ${aliasName} -> ${tsPath} to tsconfig.json`);
}

function main (): void {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: tsx scripts/add-ts-alias.ts <alias> <path>');
    console.error('Example: tsx scripts/add-ts-alias.ts @data ./src/data');
    process.exit(1);
  }

  const [alias, path] = args;

  try {
    addAliasToViteConfig(alias, path);
    addAliasToTsConfig(alias, path);
    console.log('✅ Successfully added alias to both config files');
  } catch (error) {
    console.error('❌ Error adding alias:', error);
    process.exit(1);
  }
}

// Run the script
main();
