import yargs from 'yargs';

import { connectChangelog } from '../api/index.ts';
import { ENTRY_KINDS } from '../api/utils.ts';
import getProjectConfig from '../getProjectConfig.ts';
import type { ChangelogAPIType } from '../types.ts';
import { STRANGELOG_VERSION } from '../version.ts';

import runAdd from './commands/add.ts';
import runBump from './commands/bump.ts';
import runGenerate from './commands/generate.ts';
import runMigrate from './commands/migrate.ts';
import runRenameComponent from './commands/renameComponent.ts';
import type {
  CLIOptionsType,
  CLIAddOptionsType,
  CLIGenerateOptionsType,
  CLIBumpOptionsType,
  CLIRenameComponentOptionsType
} from './types.ts';

// strangelog's own version: yargs would otherwise report the version of the package.json it finds
// from the current directory, i.e. the version of the project strangelog runs in
function getOwnVersion(): string {
  return STRANGELOG_VERSION;
}

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
            describe: `kind of change: ${ENTRY_KINDS.join(', ')}, or a custom kind from kinds in .strangelogrc`
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
          })
          .option('ticket', {
            alias: 't',
            type: 'string',
            describe: 'ticket ID, repeatable or comma separated'
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
        // `generate --version`/`-v` is the version to render, not yargs' built-in version flag
        yargs
          .version(false)
          .option('outFile', {
            alias: 'f',
            type: 'string',
            // without it, yargs reads `--outFile -` as an empty string followed by a positional "-"
            nargs: 1,
            describe: 'name of the changelog file to write, "-" for stdout',
            // default: 'CHANGELOG.md',
            demandOption: true
          })
          .option('version', {
            alias: 'v',
            type: 'string',
            describe: 'render only this version, without the "# Changelog" header'
          });
      },
      withAPI((changelog, argv: CLIGenerateOptionsType) => runGenerate(changelog, argv))
    )
    .version(getOwnVersion())
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
