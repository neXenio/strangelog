// @flow

import { join as joinPath } from 'path';

import { readFileSync } from 'fs-extra';
import groupBy from 'lodash/groupBy';
import jsYaml from 'js-yaml';
import { sync as syncGlob } from 'glob';

import type {
  ConfigType,
  ChangelogType,
  VersionChangelogType,
  VersionType
} from '../types';

import { stringifyVersion } from './utils';

const VERSION_DIRECTORY_NAME_MATCH = /([0-9]+)\.([0-9]+)$/;

export default function getChangelogData(
  config: ConfigType
): ChangelogType {
  return [
    getVersionChangelog(config, null),
    ...getSortedChangelogVersions(config).map((version) =>
      getVersionChangelog(config, version))
  ];
}

function getVersionChangelog(
  config: ConfigType,
  version: ?VersionType
): VersionChangelogType {
  return {
    version,
    entries: {
      addition: [],
      change: [],
      fix: [],
      ...groupBy((
        getVersionChangelogFileNames(config, stringifyVersion(version))
          .map((entryFileName) => readFileSync(entryFileName).toString())
          .map(jsYaml.safeLoad)
      ), 'kind')
    }
  };
}

function getSortedChangelogVersions(config: ConfigType): VersionType[] {
  return getVersionDirectoryNames(config)
    .filter((versionDirectoryName) => !versionDirectoryName.endsWith('next'))
    .map((versionDirectoryName) => versionDirectoryName.match(VERSION_DIRECTORY_NAME_MATCH))
    .map((versionMatch) => ({
      major: parseInt(versionMatch[1], 10),
      minor: parseInt(versionMatch[2], 10)
    }))
    .sort((version1, version2) => {
      if (version1.major === version2.major) {
        return version2.minor - version1.minor;
      }

      return version2.major - version1.major;
    });
}

function getVersionDirectoryNames(config: ConfigType) {
  return syncGlob(joinPath(config.path, '*'));
}

function getVersionChangelogFileNames(
  { path }: ConfigType,
  versionString: string
): string[] {
  return syncGlob(joinPath(path, versionString, '*.yml'));
}