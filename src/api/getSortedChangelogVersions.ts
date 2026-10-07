import { basename, join as joinPath } from 'path';

import { rcompare as compareSemVerDescending, valid as validSemVer } from 'semver';

import type { ConfigType } from '../types.ts';

import { globPaths } from './utils.ts';

export default function getSortedChangelogVersions(config: ConfigType): string[] {
  const versions = getVersionDirectoryNames(config)
    .map((versionDirectoryPath) => basename(versionDirectoryPath))
    .filter((versionDirectoryName) => versionDirectoryName !== 'next');

  // SemVer versions in SemVer order (1.10.0 before 1.9.0, 1.0.0 before 1.0.0-beta), followed by
  // other versions (allowed via `bump -v`, e.g. 1.2.3.4) in numeric-aware order, newest first.
  // Sorting the two groups separately keeps the order consistent.
  return [
    ...versions.filter((version) => validSemVer(version)).sort(compareSemVerDescending),
    ...versions
      .filter((version) => !validSemVer(version))
      .sort((version1, version2) => version2.localeCompare(version1, 'en', { numeric: true }))
  ];
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return globPaths(joinPath(path, '*/'));
}
