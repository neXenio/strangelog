import { join as joinPath } from 'path';

import { readFileSync } from 'fs-extra';
import { load } from 'js-yaml';

import type {
  ConfigType,
  ChangelogType,
  VersionChangelogType,
  EntryType,
  EntryKindType
} from '../types';

import { getComponentTitle, globPaths, stringifyVersion } from './utils';
import getSortedChangelogVersions from './getSortedChangelogVersions';

const entryKinds: EntryKindType[] = [
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
  version: string | null | undefined
): VersionChangelogType {
  const entries = {} as Record<EntryKindType, EntryType[]>;

  entryKinds.forEach((entryKind) => {
    entries[entryKind] = [];
  });

  getVersionChangelogFileNames(config, stringifyVersion(version))
    .map((entryFileName) => load(readFileSync(entryFileName).toString()) as EntryType)
    .sort(sortByComponent.bind(null, config))
    .forEach((entry) => {
      entries[entry.kind] = [...(entries[entry.kind] || []), entry];
    });

  return {
    version,
    entries
  };
}

function sortByComponent(config: ConfigType, entry1: EntryType, entry2: EntryType): number {
  const component1 = entry1.component;
  const component2 = entry2.component;

  if (!component1 && !component2) {
    return 0;
  }

  if (!component1) {
    return 1;
  }

  if (!component2) {
    return -1;
  }

  return getComponentTitle(config.components[component1])
    .localeCompare(getComponentTitle(config.components[component2]));
}

function getVersionChangelogFileNames(
  { path }: ConfigType,
  versionString: string
): string[] {
  // glob >= 9 no longer sorts its results; this matches the order of glob 7
  return globPaths(joinPath(path, versionString, '*.yml')).sort((a, b) => a.localeCompare(b, 'en'));
}