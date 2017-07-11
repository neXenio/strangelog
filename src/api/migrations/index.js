// @flow

import { join as joinPath } from 'path';

import { sync as syncGlob } from 'glob';
import { moveSync } from 'fs-extra';

import type { MigratorType } from '../../types';

const migrations = ([
  (config) =>
    syncGlob(joinPath(config.path, '*'))
      .forEach((versionDirectoryName) =>
        moveSync(versionDirectoryName, `${versionDirectoryName}.0`))
]: MigratorType[]);

export default migrations;

export const CURRENT_VERSION = migrations.length;