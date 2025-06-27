#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface AliasMapping {
  alias: string;
  vitePath: string;
  tsPath: string;
}

function normalizePath (p: string): string {
  return p.replace(/^\.\//, '');
}

function extractViteAliases (): Record<string, string> {
  const viteConfigPath = resolve(process.cwd(), 'vite.config.ts');
  const viteConfig = readFileSync(viteConfigPath, 'utf-8');

  const aliases: Record<string, string> = {};

  // Extract aliases from resolve.alias section
  const aliasRegex = /['"]([^'"/]+)['"]: resolve\(__dirname, ['"]([^'"]+)['"]\)/g;
  let match;

  while ((match = aliasRegex.exec(viteConfig)) !== null) {
    const aliasName = match[1];
    const path = match[2];
    aliases[aliasName] = path;
  }

  return aliases;
}

function extractTsAliases (): Record<string, string> {
  const tsConfigPath = resolve(process.cwd(), 'tsconfig.json');
  const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));

  const aliases: Record<string, string> = {};

  if (tsConfig.compilerOptions?.paths) {
    for (const [alias, paths] of Object.entries(tsConfig.compilerOptions.paths)) {
      if (Array.isArray(paths) && paths.length > 0) {
        // Remove the /* suffix for comparison
        const normalizedAlias = alias.replace(/\/\*$/, '');
        const path = (paths[0] as string).replace(/\/\*$/, '');
        aliases[normalizedAlias] = path;
      }
    }
  }

  return aliases;
}

function compareAliases (): AliasMapping[] {
  const viteAliases = extractViteAliases();
  const tsAliases = extractTsAliases();

  const allAliases = new Set([...Object.keys(viteAliases), ...Object.keys(tsAliases)]);
  const mappings: AliasMapping[] = [];

  for (const alias of allAliases) {
    const vitePath = viteAliases[alias] || 'NOT_FOUND';
    const tsPath = tsAliases[alias] || 'NOT_FOUND';

    mappings.push({
      alias,
      vitePath,
      tsPath,
    });
  }

  return mappings;
}

function main (): void {
  try {
    const mappings = compareAliases();

    console.log('🔍 Comparing aliases between vite.config.ts and tsconfig.json (normalized, path normalization applied)\n');

    let hasMismatches = false;
    let hasMissing = false;

    for (const mapping of mappings) {
      const viteNorm = mapping.vitePath !== 'NOT_FOUND' ? normalizePath(mapping.vitePath) : mapping.vitePath;
      const tsNorm = mapping.tsPath !== 'NOT_FOUND' ? normalizePath(mapping.tsPath) : mapping.tsPath;
      if (viteNorm === 'NOT_FOUND' || tsNorm === 'NOT_FOUND') {
        console.log(`❌ @${mapping.alias}:`);
        console.log(`   vite.config.ts: ${mapping.vitePath}`);
        console.log(`   tsconfig.json:  ${mapping.tsPath}`);
        console.log('');
        hasMissing = true;
      } else if (viteNorm !== tsNorm) {
        console.log(`⚠️  @${mapping.alias}:`);
        console.log(`   vite.config.ts: ${mapping.vitePath}`);
        console.log(`   tsconfig.json:  ${mapping.tsPath}`);
        console.log('');
        hasMismatches = true;
      } else {
        console.log(`✅ @${mapping.alias}: ${viteNorm}`);
      }
    }

    console.log('');

    if (hasMissing) {
      console.log('❌ Some aliases are missing from one or both config files');
      process.exit(1);
    } else if (hasMismatches) {
      console.log('⚠️  Some aliases have different paths in the config files');
      process.exit(1);
    } else {
      console.log('✅ All aliases are properly configured and match!');
    }

  } catch (error) {
    console.error('❌ Error comparing aliases:', error);
    process.exit(1);
  }
}

// Run the script
main();
