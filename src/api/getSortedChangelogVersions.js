// @flow

import { basename, join as joinPath } from 'path';

import type { ConfigType } from '../types';

import { globPaths } from './utils';

export default function getSortedChangelogVersions(config: ConfigType): string[] {
  return getVersionDirectoryNames(config)
    .map((versionDirectoryPath) => basename(versionDirectoryPath))
    .filter((versionDirectoryName) => versionDirectoryName !== 'next')
    .sort().reverse();
}

function getVersionDirectoryNames({ path }: ConfigType): string[] {
  return globPaths(joinPath(path, '*/'));
}