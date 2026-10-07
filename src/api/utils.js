// @flow

import { globSync } from 'glob';

// glob >= 9 treats `\` as an escape character; keep `path.join()`-built patterns working on Windows
export function globPaths(pattern: string): string[] {
  return globSync(pattern, { windowsPathsNoEscape: true });
}

export function stringifyVersion(version: ?string): string {
  if (!version) {
    return 'next';
  }

  return version;
}

export function multiToSingleLineString(multiLineIndentedString: string): string {
  return multiLineIndentedString.replace(/\n[ \t]*/g, ' ').trim();
}
