// @flow

import inquirer from 'inquirer';

import { stringifyVersion } from '../../api/utils';
import type { ChangelogAPIType, VersionType } from '../../types';

export default async function runBump(
  { bumpNextVersion, getPossibleNextVersions }: ChangelogAPIType
) {
  console.log('Bumping changelog for "next" version');

  const possibleNextVersions = getPossibleNextVersions();
  const { nextVersion } = await promptNewVersionInformation(
    possibleNextVersions
      ? possibleNextVersions.map((version: VersionType) => ({
        name: stringifyVersion(version),
        value: version
      }))
      : [{
        name: '0.0.1 (Initial Version)',
        value: {
          major: 0,
          minor: 0,
          patch: 1
        }
      }]
  );

  bumpNextVersion(nextVersion);
}

function promptNewVersionInformation(versions) {
  return inquirer.prompt([{
    name: 'nextVersion',
    type: 'list',
    message: 'How should the new version be called?',
    choices: versions
  }]);
}