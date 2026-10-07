// Runs the CLI from its TypeScript sources for any working directory, so CLI tests exercise
// src/ without a prior `yarn compile`. tsx compiles the sources on the fly.
const { resolve } = require('path');

require('tsx/cjs/api').register();
require(resolve(__dirname, '..', 'src/cli/index.ts'));
