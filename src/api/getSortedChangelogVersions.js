// @flow

import { basename, join as joinPath } from 'path';

import { rcompare as compareSemVerDescending, valid as validSemVer } from 'semver';

import type { ConfigType } from '../types';

import { globPaths } from './utils';

export default function getSortedChangelogVersions(config: ConfigType): string[] {
  return getVersionDirectoryNames(config)
    .map((versionDirectoryPath) => basename(versionDirectoryPath))
    .filter((versionDirectoryName) => versionDirectoryName !== 'next')
    .sort(compareVersionsDescending);
}

// SemVer order where both versions are valid SemVer (so 1.10.0 comes before 1.9.0 and 1.0.0
// before 1.0.0-beta), numeric-aware string order otherwise (e.g. for `bump -v 1.2.3.4`)
function compareVersionsDescending(version1: string, version2: string): number {
  if (validSemVer(version1) && validSemVer(version2)) {
    return compareSemVerDescending(version1, version2);
  }

  return version2.localeCompare(version1, 'en', { numeric: true });
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return globPaths(joinPath(path, '*/'));
}