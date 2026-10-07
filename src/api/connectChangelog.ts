import type { ConfigType, ChangelogAPIType } from '../types.ts';

import addEntry from './addEntry.ts';
import bumpNextVersion from './bumpNextVersion.ts';
import { getChangelogInfo, saveChangelogInfo } from './changelogInfo.ts';
import generate from './generate.ts';
import getAutomaticNextVersion from './getAutomaticNextVersion.ts';
import getChangelogData from './getChangelogData.ts';
import getPossibleNextVersions from './getPossibleNextVersions.ts';
import migrate from './migrate.ts';
import renameComponent from './renameComponent.ts';

export default function connectChangelog(config: ConfigType): ChangelogAPIType {
  return {
    addEntry(entry) {
      return addEntry(config, entry);
    },
    bumpNextVersion(nextVersion) {
      return bumpNextVersion(config, nextVersion);
    },
    getChangelogData() {
      return getChangelogData(config);
    },
    generate() {
      return generate(config, getChangelogData(config));
    },
    getPossibleNextVersions,
    getAutomaticNextVersion() {
      return getAutomaticNextVersion(config);
    },
    getComponentsConfig() {
      return config.components;
    },
    migrate() {
      return migrate(config);
    },
    renameComponent(from, to) {
      return renameComponent(config, from, to);
    },
    getChangelogInfo() {
      return getChangelogInfo(config);
    },
    saveChangelogInfo(newChangelogInfo) {
      return saveChangelogInfo(config, newChangelogInfo);
    }
  };
}
