// @flow

import yargs from 'yargs';

import { connectChangelog } from '../api';
import getProjectConfig from '../getProjectConfig';
import type { ChangelogAPIType } from '../types';

import type {
  CLIOptionsType,
  CLIGenerateOptionsType,
  CLIBumpOptionsType
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
      (yargs) => {
        // `bump --version`/`-v` is the version to bump to, not yargs' built-in version flag
        yargs.version(false).option('version', {
          alias: 'v',
          describe: 'next version to bump to'
        });
      },
      withAPI((changelog, argv: CLIBumpOptionsType) => runBump(changelog, argv))
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
    .help()
    .parse();
}

function withAPI<ArgvType extends CLIOptionsType>(
  commandFunction: (changelog: ChangelogAPIType, argv: ArgvType) => Promise<void>
): (argv: ArgvType) => Promise<void> {
  return (argv: ArgvType) => {
    const changelog = connectChangelog(getProjectConfig());

    return commandFunction(changelog, argv);
  };
}
