// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';
import { moveSync } from 'fs-extra';

import type { ConfigType } from '../../types';

export default function toSemVerDirectories(config: ConfigType) {
  syncGlob(joinPath(config.path, '*'))
    .forEach((versionDirectoryName) =>
      moveSync(versionDirectoryName, `${versionDirectoryName}.0`));
}