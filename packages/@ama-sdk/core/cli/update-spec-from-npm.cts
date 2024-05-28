#!/usr/bin/env node

/*
 * Update the OpenAPI spec from an NPM package
 */

import * as minimist from 'minimist';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join } from 'node:path';
import { copyFile, readFile } from 'node:fs/promises';
import type { PackageJson } from 'type-fest';
import type { OpenApiToolsConfiguration, OpenApiToolsGenerator } from '@ama-sdk/core';

const argv = minimist(process.argv.slice(2));
const packageName = argv._[0];
const { help, output, 'package-path': packagePath, quiet } = argv;
const openApiConfigDefaultPath = './openapitools.json';
const supportedExtensions = ['json', 'yaml', 'yml'];
const noop = () => undefined;
const logger = quiet ? {error: noop, warn: noop, log: noop, info: noop, debug: noop} : console;

if (help) {
  // eslint-disable-next-line no-console
  console.log(`This script can be used to update your local spec file from a given locally installed npm package.
  Usage: amasdk-update-spec-from-npm <package-name> [--package-path] [--output] [--quiet]

    package-name      The full identifier of the npm package (e.g. @my-scope/my-package)
    --package-path    The relative path inside the npm package where to find the spec file (default: './openapi.yml')
    --output          The path where the spec file should be copied (default: './openapi.yml')
    --quiet           Don't log anything
  `);
  process.exit(0);
}

if (!packageName) {
  logger.error('Need to provide packageName, use `amasdk-update-spec-from-npm --help` for more information');
  process.exit(-1);
}

void (async () => {
  let specSourcePath;
  const appRequire = createRequire(join(process.cwd(), 'package.json'));
  const packageJsonPath = appRequire.resolve(`${packageName}/package.json`);
  if (!packagePath) {
    const packageJson = JSON.parse(await readFile(packageJsonPath, {encoding: 'utf8'})) as PackageJson;
    const exportMatcher = new RegExp(`openapi\\.(?:${supportedExtensions.join('|')})$`);
    const matchingExport = packageJson.exports && Object.keys(packageJson.exports).find((exportPath) => exportMatcher.test(exportPath));
    if (matchingExport) {
      specSourcePath = appRequire.resolve(`${packageName}/${matchingExport}`);
    }
  } else {
    specSourcePath = packageJsonPath.replace(/package.json$/, packagePath);
  }
  if (!specSourcePath || !existsSync(specSourcePath)) {
    logger.error(`Unable to find source spec from ${packageName}, please make sure it is correctly exported in package.json`);
    process.exit(-2);
  }

  let specDestinationPath = output;
  if (!specDestinationPath) {
    const specSourceExtension = extname(specSourcePath);
    specDestinationPath = `./openapi${specSourceExtension}`;
    if (existsSync(openApiConfigDefaultPath)) {
      const openApiConfig = JSON.parse(await readFile(openApiConfigDefaultPath, {encoding: 'utf8'})) as OpenApiToolsConfiguration;
      const generators: OpenApiToolsGenerator[] = Object.values(openApiConfig['generator-cli']?.generators ?? {});
      if (generators.length === 1 && generators[0].inputSpec && extname(generators[0].inputSpec) === specSourceExtension) {
        specDestinationPath = generators[0].inputSpec;
      }
    }
  }

  logger.info(`Updating spec file from "${specSourcePath}" to "${specDestinationPath}" (CWD: "${process.cwd()}")`);
  await copyFile(specSourcePath, specDestinationPath);
})();
