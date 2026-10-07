// Runs the CLI from source for any working directory: babel only compiles files inside its `cwd`,
// so it is pinned to the repository root instead of the test project the CLI operates on.
const { resolve } = require('path');

const rootPath = resolve(__dirname, '..');

require('@babel/register').default({ cwd: rootPath });
require(resolve(rootPath, 'src/cli/index.js'));
