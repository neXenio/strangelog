import { existsSync, readFileSync } from 'fs-extra';
import { inc as incrementSemVer } from 'semver';

import type { ConfigType } from '../types';

import getChangelogData from './getChangelogData';

// Derives the next SemVer version from the package.json version and the "next" entries:
// any change -> major, otherwise any addition -> minor, otherwise patch
export default function getAutomaticNextVersion(config: ConfigType): string | null {
  if (!existsSync('package.json')) {
    return null;
  }

  const { version } = JSON.parse(readFileSync('package.json').toString());
  const { entries } = getChangelogData(config)[0];

  if (entries.change.length > 0) {
    return incrementSemVer(version, 'major');
  }

  if (entries.addition.length > 0) {
    return incrementSemVer(version, 'minor');
  }

  return incrementSemVer(version, 'patch');
}
