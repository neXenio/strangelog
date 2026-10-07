#!/usr/bin/env node

import cli from './cli.ts';

// See https://github.com/yargs/yargs/issues/605
cli(process.argv.slice(2));
