import yargs from 'yargs';

import { connectChangelog } from '../api';
import { ENTRY_KINDS } from '../api/utils';
import getProjectConfig from '../getProjectConfig';
import type { ChangelogAPIType } from '../types';

import runAdd from './commands/add';
import runBump from './commands/bump';
import runGenerate from './commands/generate';
import runMigrate from './commands/migrate';
import runRenameComponent from './commands/renameComponent';
import type {
  CLIOptionsType,
  CLIAddOptionsType,
  CLIGenerateOptionsType,
  CLIBumpOptionsType,
  CLIRenameComponentOptionsType
} from './types';

export default function cli(args: string[]) {
  if (!args.length) args = ['--help'];

  void yargs(args)
    .command<CLIAddOptionsType>(
      'add',
      'adds a changelog entry (prompts unless --kind, --component or --description is given)',
      (yargs) => {
        yargs
          .option('kind', {
            alias: 'k',
            type: 'string',
            describe: `kind of change: ${ENTRY_KINDS.join(', ')}`
          })
          .option('component', {
            alias: 'c',
            type: 'string',
            describe: 'ID of the affected component from .strangelogrc'
          })
          .option('description', {
            alias: 'd',
            type: 'string',
            describe: 'what changed, at least 10 characters'
          });
      },
      withAPI((changelog, argv: CLIAddOptionsType) => runAdd(changelog, argv))
    )
    .command<CLIBumpOptionsType>(
      'bump',
      'bumps "next" changelog to new version',
      (yargs) => {
        // `bump --version`/`-v` is the version to bump to, not yargs' built-in version flag
        yargs
          .version(false)
          .option('version', {
            alias: 'v',
            describe: 'next version to bump to'
          })
          .option('auto', {
            alias: 'a',
            type: 'boolean',
            describe:
              'derive the next SemVer version from the "next" entries: major for changes, '
              + 'minor for additions, patch otherwise'
          })
          .conflicts('auto', 'version');
      },
      withAPI((changelog, argv: CLIBumpOptionsType) => runBump(changelog, argv))
    )
    .command<CLIOptionsType>(
      'migrate',
      'migrates changelog files to latest version after updating strangelog',
      () => {},
      withAPI((changelog) => runMigrate(changelog))
    )
    .command<CLIRenameComponentOptionsType>(
      'rename-component <from> <to>',
      'moves all entries of component <from> to component <to> (renames or merges components)',
      (yargs) => {
        yargs.positional('from', { type: 'string' }).positional('to', { type: 'string' });
      },
      withAPI((changelog, argv: CLIRenameComponentOptionsType) =>
        runRenameComponent(changelog, argv)
      )
    )
    .command<CLIGenerateOptionsType>(
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
