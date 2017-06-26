// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';

import type { ConfigType, VersionType } from '../types';

const VERSION_DIRECTORY_NAME_MATCH = /([0-9]+)\.([0-9]+)$/;

export default function getPossibleNextVersions(
  config: ConfigType
): VersionType[] | null {
  const latestVersion = getLatestChangelogVersion(config);

  if (!latestVersion) {
    return null;
  }

  return [{
    major: latestVersion.major,
    minor: latestVersion.minor + 1
  }, {
    major: latestVersion.major + 1,
    minor: 0
  }];
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return syncGlob(joinPath(path, '*'));
}

function getSortedChangelogVersions(config: ConfigType): VersionType[] {
  return getVersionDirectoryNames(config)
    .filter((versionDirectoryName) => !versionDirectoryName.endsWith('next'))
    .map((versionDirectoryName) => {
      const versionMatch = versionDirectoryName.match(VERSION_DIRECTORY_NAME_MATCH);

      if (!versionMatch) {
        throw new Error(`Directory "${versionDirectoryName}" does not have a valid version`);
      }

      return versionMatch;
    })
    .map((versionMatch) => ({
      major: parseInt(versionMatch[1], 10),
      minor: parseInt(versionMatch[2], 10)
    }))
    .sort((version1, version2) => {
      if (version1.major === version2.major) {
        return version2.minor - version1.minor;
      }

      return version2.major - version1.major;
    });
}


export function getLatestChangelogVersion(config: ConfigType) {
  return getSortedChangelogVersions(config)[0];
}