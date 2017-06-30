// @flow

import type { ConfigType, VersionType } from '../types';

import getSortedChangelogVersions from './getSortedChangelogVersions';

export default function getPossibleNextVersions(
  config: ConfigType
): VersionType[] | null {
  const latestVersion = getLatestChangelogVersion(config);

  if (!latestVersion) {
    return null;
  }

  return [{
    major: latestVersion.major,
    minor: latestVersion.minor,
    patch: latestVersion.patch + 1
  }, {
    major: latestVersion.major,
    minor: latestVersion.minor + 1,
    patch: 0
  }, {
    major: latestVersion.major + 1,
    minor: 0,
    patch: 0
  }];
}


export function getLatestChangelogVersion(config: ConfigType) {
  return getSortedChangelogVersions(config)[0];
}