// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';

import type { ConfigType } from '../types';

const VERSION_DIRECTORY_NAME_MATCH = /([^\/]+)?\/$/;

export default function getSortedChangelogVersions(config: ConfigType): string[] {
  return getVersionDirectoryNames(config)
    .map((versionDirectoryName) => {
      const versionDirectoryMatch = versionDirectoryName.match(VERSION_DIRECTORY_NAME_MATCH);

      if (!versionDirectoryMatch) {
        throw new Error(
          `Could not detect valid version on version directory ${versionDirectoryName}`
        );
      }

      return versionDirectoryMatch[1];
    })
    .filter((versionDirectoryName) => versionDirectoryName !== 'next')
    .sort().reverse();
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return syncGlob(joinPath(path, '*/'));
}