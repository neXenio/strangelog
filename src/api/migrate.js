// @flow

import type {
  ConfigType,
  MigrationResultType,
  MigratorType,
  ChangelogInfoType
} from '../types';

import { getChangelogInfo, saveChangelogInfo } from './changelogInfo';
import migrations from './migrations';

export default function migrate(
  config: ConfigType
): MigrationResultType {
  const oldChangelogInfo: ChangelogInfoType = getChangelogInfo(config);

  migrations
    .slice(oldChangelogInfo.version)
    .forEach((migrateNext: MigratorType) => {
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
