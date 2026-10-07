import { join as joinPath } from 'path';

import { moveSync } from 'fs-extra';

import type { ConfigType } from '../../types';
import { globPaths } from '../utils';

export default function toSemVerDirectories(config: ConfigType) {
  globPaths(joinPath(config.path, '*'))
    .forEach((versionDirectoryName) =>
      moveSync(versionDirectoryName, `${versionDirectoryName}.0`));
}