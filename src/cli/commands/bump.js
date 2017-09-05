// @flow

import inquirer from 'inquirer';

import { stringifyVersion } from '../../api/utils';
import type { ChangelogAPIType } from '../../types';
import type {
  CLIBumpOptionsType
} from '../types';

export default async function runBump(
  changelogAPI: ChangelogAPIType,
  { version }: CLIBumpOptionsType
) {
  console.log('Bumping changelog for "next" version');

  const nextVersion = version || (await promptNewVersionInformation(changelogAPI)).nextVersion;

  changelogAPI.bumpNextVersion(nextVersion);
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

  return inquirer.prompt([{
    name: 'nextVersion',
    type: 'list',
    message: 'How should the new version be called?',
    choices: versions
  }]);
}
