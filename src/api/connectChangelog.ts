import type { ConfigType, ChangelogAPIType } from '../types';

import addEntry from './addEntry';
import bumpNextVersion from './bumpNextVersion';
import { getChangelogInfo, saveChangelogInfo } from './changelogInfo';
import generate from './generate';
import getAutomaticNextVersion from './getAutomaticNextVersion';
import getChangelogData from './getChangelogData';
import getPossibleNextVersions from './getPossibleNextVersions';
import migrate from './migrate';
import renameComponent from './renameComponent';

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
