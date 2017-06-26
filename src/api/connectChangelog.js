// @flow

import type { ConfigType, ChangelogAPIType } from '../types';

import addEntry from './addEntry';
import bumpNextVersion from './bumpNextVersion';
import generate from './generate';
import getChangelogData from './getChangelogData';
import getPossibleNextVersions from './getPossibleNextVersions';

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
    getPossibleNextVersions() {
      return getPossibleNextVersions(config);
    },
    getComponentsConfig() {
      return config.components;
    }
  };
}
