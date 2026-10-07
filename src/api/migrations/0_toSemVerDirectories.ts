import { join as joinPath } from 'path';

import { moveSync } from '../../fileSystem.ts';
import type { ConfigType } from '../../types.ts';
import { globPaths } from '../utils.ts';

export default function toSemVerDirectories(config: ConfigType) {
  globPaths(joinPath(config.path, '*')).forEach((versionDirectoryName) =>
    moveSync(versionDirectoryName, `${versionDirectoryName}.0`)
  );
}
