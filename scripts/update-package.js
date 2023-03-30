const fs = require('node:fs');
const path = require('node:path');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const packageJson = require(path.resolve(process.cwd(), argv._[0]));

Object.entries(argv)
  .filter((item) => item[0] !== '_')
  .forEach((item) => packageJson[item[0]] = item[1]);

fs.writeFileSync(argv._[0], JSON.stringify(packageJson, null, 2), {encoding: 'utf-8'});
