import inquirer from 'inquirer';

import { stringifyVersion } from '../../api/utils';
import type { ChangelogAPIType } from '../../types';
import type {
  CLIBumpOptionsType
} from '../types';

export default async function runBump(
  changelogAPI: ChangelogAPIType,
  { version, auto }: CLIBumpOptionsType
) {
  console.log('Bumping changelog for "next" version');

  const nextVersion = version
    || (auto && getAutomaticVersion(changelogAPI))
    || (await promptNewVersionInformation(changelogAPI)).nextVersion;

  changelogAPI.bumpNextVersion(nextVersion);
}

function getAutomaticVersion({ getAutomaticNextVersion }: ChangelogAPIType): string {
  const automaticVersion = getAutomaticNextVersion();

  if (!automaticVersion) {
    throw new Error('Cannot derive the next version: package.json with a valid "version" needed');
  }

  console.log(`Automatically selected version ${automaticVersion}`);

  return automaticVersion;
}

async function promptNewVersionInformation(
  { getPossibleNextVersions }: ChangelogAPIType
) {
  const possibleNextVersions = getPossibleNextVersions();
  const versions = possibleNextVersions
    ? possibleNextVersions.map((version) => ({
      name: stringifyVersion(version),
      value: stringifyVersion(version)
    }))
    : [{
      name: '0.0.1 (Initial Version)',
      value: '0.0.1'
    }];

  return inquirer.prompt<{ nextVersion: string }>([{
    name: 'nextVersion',
    type: 'select',
    message: 'How should the new version be called?',
    choices: versions
  }]);
}
