// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';

import type {
  ConfigType,
  VersionType
} from '../types';

/*
  RegExp groups:
    1 = major version
    2 = minor version
    3 = optional patch version-part incl. dot (e.g. ".3")
    4 = patch version
*/
const VERSION_DIRECTORY_NAME_MATCH = /([0-9]+)\.([0-9]+)(\.([0-9]+))?$/;

export default function getSortedChangelogVersions(config: ConfigType): VersionType[] {
  return getVersionDirectoryNames(config)
    .filter((versionDirectoryName) => !versionDirectoryName.endsWith('next'))
    .map((versionDirectoryName) => {
      const versionDirectoryMatch = versionDirectoryName.match(VERSION_DIRECTORY_NAME_MATCH);

      if (!versionDirectoryMatch) {
        throw new Error(
          `Could not detect valid version on version directory ${versionDirectoryName}`
        );
      }

      return versionDirectoryMatch;
    }).map((versionMatch) => ({
      major: parseInt(versionMatch[1], 10),
      minor: parseInt(versionMatch[2], 10),
      // The patch version is optional in the regexp which is why an intermediate 3rd group is
      // needed and patch version resides in the 4th group
      patch: versionMatch[4]
        ? parseInt(versionMatch[4], 10)
        : 0
    }))
    .sort(sortVersions);
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return syncGlob(joinPath(path, '*'));
}

function sortVersions(version1: VersionType, version2: VersionType): number {
  if (version1.major !== version2.major) {
    return version2.major - version1.major;
  }

  if (version1.minor !== version2.minor) {
    return version2.minor - version1.minor;
  }

  return version2.patch - version1.patch;
}