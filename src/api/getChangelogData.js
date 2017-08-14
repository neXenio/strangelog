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
  VersionType,
  EntryType
} from '../types';

import { stringifyVersion } from './utils';
import getSortedChangelogVersions from './getSortedChangelogVersions';

const entryKinds = [
  'addition',
  'change',
  'fix',
  'removal',
  'deprecation',
  'security',
];

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
      ...entryKinds.reduce((kinds, entryKind) => ({
        ...kinds,
        [entryKind]: []
      }), {}),
      ...groupBy((
        getVersionChangelogFileNames(config, stringifyVersion(version))
          .map((entryFileName) => readFileSync(entryFileName).toString())
          .map(jsYaml.safeLoad)
          .sort(sortByComponent.bind(null, config))
      ), 'kind')
    }
  };
}

function sortByComponent(config: ConfigType, entry1: EntryType, entry2: EntryType) {
  if (!entry1.component && !entry2.component) {
    return 0;
  }

  if (!entry1.component && entry2.component) {
    return 1;
  }

  if (entry1.component && !entry2.component) {
    return -1;
  }

  // $FlowFixMe: Checks above cover that
  return config.components[entry1.component].localeCompare(config.components[entry2.component]);
}

function getVersionChangelogFileNames(
  { path }: ConfigType,
  versionString: string
): string[] {
  return syncGlob(joinPath(path, versionString, '*.yml'));
}