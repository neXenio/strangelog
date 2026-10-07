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
    bumpNextVersion(nextVersion, options) {
      return bumpNextVersion(config, nextVersion, options);
    },
    getChangelogData() {
      return getChangelogData(config);
    },
    generate(options) {
      return generate(config, getChangelogData(config), options);
    },
    getPossibleNextVersions,
    getAutomaticNextVersion() {
      return getAutomaticNextVersion(config);
    },
    getComponentsConfig() {
      return config.components;
    },
    getConfig() {
      return config;
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
