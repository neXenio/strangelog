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
import getSortedChangelogVersions from './getSortedChangelogVersions';


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

function getVersionChangelogFileNames(
  { path }: ConfigType,
  versionString: string
): string[] {
  return syncGlob(joinPath(path, versionString, '*.yml'));
}