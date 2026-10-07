import type { ConfigType, MigrationResultType, MigratorType, ChangelogInfoType } from '../types.ts';

import { getChangelogInfo, saveChangelogInfo } from './changelogInfo.ts';
import migrations from './migrations/index.ts';

export default function migrate(config: ConfigType): MigrationResultType {
  const oldChangelogInfo: ChangelogInfoType = getChangelogInfo(config);

  migrations.slice(oldChangelogInfo.version).forEach((migrateNext: MigratorType) => {
    migrateNext(config);
  });

  saveChangelogInfo(config, {
    version: migrations.length
  });

  return {
    from: oldChangelogInfo.version,
    to: migrations.length
  };
}
