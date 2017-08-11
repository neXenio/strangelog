// @flow

import yargs from 'yargs';

import { connectChangelog } from '../api';
import getProjectConfig from '../getProjectConfig';

import type {
  CLIOptionsType,
  CLIGenerateOptionsType
} from './types';
import runAdd from './commands/add';
import runBump from './commands/bump';
import runGenerate from './commands/generate';
import runMigrate from './commands/migrate';

export default function cli(args: string[]) {
  yargs(args)
    .command(
      'add',
      'adds a changelog entry',
      () => {},
      withAPI((changelog) => runAdd(changelog))
    )
    .command(
      'bump',
      'bumps "next" changelog to new version',
      () => {},
      withAPI((changelog) => runBump(changelog))
    )
    .command(
      'migrate',
      'migrates changelog files to latest version after updating strangelog',
      () => {},
      withAPI((changelog) => runMigrate(changelog))
    )
    .command(
      'generate',
      'generates changelog for all versions',
      (yargs) => {
        yargs.option('outFile', {
          alias: 'f',
          describe: 'name of the changelog file to write',
          // default: 'CHANGELOG.md',
          demandOption: true
        });
      },
      withAPI((changelog, argv: CLIGenerateOptionsType) => runGenerate(changelog, argv))
    )
    .options({
      directory: {
        alias: 'd',
        describe: 'directory where changelog files are stored',
        default: './changelog',
        type: 'string'
      }
    })
    .help()
    .argv;
  }

function withAPI(commandFunction) {
  return (argv: CLIOptionsType, ...args) => {
    const changelog = connectChangelog({
      ...getProjectConfig(),
      path: argv.directory
    });

    return commandFunction(changelog, argv, ...args);
  };
}
