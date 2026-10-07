import { outputFileSync } from '../../fileSystem.ts';
import type { ChangelogAPIType } from '../../types.ts';
import type { CLIGenerateOptionsType } from '../types.ts';

export default async function runGenerate(
  changelog: ChangelogAPIType,
  { outFile }: CLIGenerateOptionsType
) {
  const markdown = changelog.generate();

  outputFileSync(outFile, markdown);
}
