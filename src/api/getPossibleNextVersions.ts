import { readFileSync, existsSync } from 'fs-extra';
import { inc as incrementSemVer, valid as validSemVer } from 'semver';

export default function getPossibleNextVersions(): string[] | null {
  const packageVersion = existsSync('package.json')
    ? validSemVer(JSON.parse(readFileSync('package.json').toString()).version)
    : null;

  if (!packageVersion) {
    return null;
  }

  // inc() only returns null for invalid versions, and packageVersion is valid here
  return [
    incrementSemVer(packageVersion, 'patch'),
    incrementSemVer(packageVersion, 'minor'),
    incrementSemVer(packageVersion, 'major')
  ] as string[];
}
