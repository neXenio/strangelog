import type { MigratorType } from '../../types.ts';

import migration0 from './0_toSemVerDirectories.ts';
import migration1 from './1_toFSFriendlyEntryFileName.ts';

const migrations: MigratorType[] = [migration0, migration1];

export default migrations;

export const CURRENT_VERSION = migrations.length;
