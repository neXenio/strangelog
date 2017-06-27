#!/usr/bin/env node

// @flow

import 'babel-polyfill';

import cli from './cli';

// See https://github.com/yargs/yargs/issues/605
cli(process.argv.slice(2));
