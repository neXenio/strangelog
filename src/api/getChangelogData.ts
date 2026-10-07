import { existsSync, readFileSync } from 'node:fs';
import { join as joinPath } from 'path';

import { load } from 'js-yaml';

import type {
  ConfigType,
  ChangelogType,
  VersionChangelogType,
  EntryType,
  EntryKindType
} from '../types.ts';

import getSortedChangelogVersions from './getSortedChangelogVersions.ts';
import {
  ENTRY_KINDS,
  getComponentTitle,
  globPaths,
  isBuiltInKind,
  stringifyVersion
} from './utils.ts';

export default function getChangelogData(config: ConfigType): ChangelogType {
  return [
    getVersionChangelog(config, null),
    ...getSortedChangelogVersions(config).map((version) => getVersionChangelog(config, version))
  ];
}

// Built-in kinds first, then the custom kinds of `kinds`; kinds that only appear in entries are
// appended when they are found
function getKindsInOrder({ kinds }: ConfigType): EntryKindType[] {
  return [...ENTRY_KINDS, ...(kinds || []).filter((kind) => !isBuiltInKind(kind))];
}

function getVersionChangelog(
  config: ConfigType,
  version: string | null | undefined
): VersionChangelogType {
  const entries = {} as Record<EntryKindType, EntryType[]>;

  getKindsInOrder(config).forEach((entryKind) => {
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
    ...getReleaseInfo(config, version),
    entries
  };
}

// `bump` writes the release date to <version>/.release.yml; older versions have none
function getReleaseInfo(
  { path }: ConfigType,
  version: string | null | undefined
): Pick<VersionChangelogType, 'date'> {
  const releaseFilePath = joinPath(path, stringifyVersion(version), '.release.yml');

  if (!version || !existsSync(releaseFilePath)) {
    return {};
  }

  const { date } = (load(readFileSync(releaseFilePath).toString()) || {}) as {
    date?: string | Date;
  };

  // an unquoted date in a hand-written file is loaded as a Date
  return { date: date instanceof Date ? date.toISOString().slice(0, 10) : (date ?? null) };
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

  return getComponentTitle(config.components[component1]).localeCompare(
    getComponentTitle(config.components[component2])
  );
}

function getVersionChangelogFileNames({ path }: ConfigType, versionString: string): string[] {
  // glob >= 9 no longer sorts its results; this matches the order of glob 7
  return globPaths(joinPath(path, versionString, '*.yml')).sort((a, b) => a.localeCompare(b, 'en'));
}
