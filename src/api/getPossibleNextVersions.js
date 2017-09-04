// @flow

import { readFileSync, existsSync } from 'fs-extra';
import { parse as parseSemVer } from 'semver';

import type { VersionType } from '../types';

export default function getPossibleNextVersions(): VersionType[] | null {
  const packageVersion = existsSync('package.json')
    ? parseSemVer(JSON.parse(readFileSync('package.json').toString()).version)
    : null;

  if (!packageVersion) {
    return null;
  }

  return [{
    major: packageVersion.major,
    minor: packageVersion.minor,
    patch: packageVersion.patch + 1
  }, {
    major: packageVersion.major,
    minor: packageVersion.minor + 1,
    patch: 0
  }, {
    major: packageVersion.major + 1,
    minor: 0,
    patch: 0
  }];
}
