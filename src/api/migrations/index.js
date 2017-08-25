// @flow

import type { MigratorType } from '../../types';

import migration0 from './0_toSemVerDirectories';
import migration1 from './1_toFSFriendlyEntryFileName';

const migrations = ([
  migration0,
  migration1
]: MigratorType[]);

export default migrations;

export const CURRENT_VERSION = migrations.length;