// @flow

import type { VersionType } from '../types';

export function stringifyVersion(version: ?VersionType): string {
  if (!version) {
    return 'next';
  }

  const { major, minor } = version;

  return `${major}.${minor}`;
}

export function multiToSingleLineString(multiLineIndentedString: string): string {
  return multiLineIndentedString.replace(/\n[ \t]*/g, ' ').trim();
}
