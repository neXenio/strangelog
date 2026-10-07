import type { ChangelogAPIType } from '../../types.ts';
import type { CLIRenameComponentOptionsType } from '../types.ts';

export default async function runRenameComponent(
  changelog: ChangelogAPIType,
  { from, to }: CLIRenameComponentOptionsType
) {
  const movedEntriesCount = changelog.renameComponent(from, to);

  console.log(`Moved ${movedEntriesCount} entries from component "${from}" to "${to}"`);

  if (Object.keys(changelog.getComponentsConfig()).includes(from)) {
    console.log(`Remove "${from}" from the components in .strangelogrc if it is no longer needed`);
  }
}
