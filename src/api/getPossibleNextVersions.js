// @flow

import { readFileSync, existsSync } from 'fs-extra';
import { parse as parseSemVer } from 'semver';

export default function getPossibleNextVersions(): string[] | null {
  const packageVersion = existsSync('package.json')
    ? parseSemVer(JSON.parse(readFileSync('package.json').toString()).version)
    : null;

  if (!packageVersion) {
    return null;
  }

  const { major, minor, patch } = packageVersion;

  return [
    `${major}.${minor}.${patch + 1}`,
    `${major}.${minor + 1}.${patch}`,
    `${major + 1}.${minor}.${patch}`
  ];
}
