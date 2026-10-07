// Runs as the `version` lifecycle script (`yarn version` / `npm version`): writes the new
// package.json version into src/version.ts, which the CLI reports for --version
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const rootPath = join(__dirname, '..');
const { version } = JSON.parse(readFileSync(join(rootPath, 'package.json')).toString());
const versionFilePath = join(rootPath, 'src', 'version.ts');
const source = readFileSync(versionFilePath).toString();

writeFileSync(
  versionFilePath,
  source.replace(/STRANGELOG_VERSION = '[^']*'/, `STRANGELOG_VERSION = '${version}'`)
);
