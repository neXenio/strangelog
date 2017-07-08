// @flow

import { type ChangelogAPIType } from '../../types';

export default async function runMigrate(
  changelog: ChangelogAPIType
) {
  const { from, to } = changelog.migrate();

  console.log(`Successfully migrated from version ${from} to version ${to}`);
}
