import { outputFileSync } from '../../fileSystem.ts';
import type { ChangelogAPIType } from '../../types.ts';
import type { CLIGenerateOptionsType } from '../types.ts';

export default async function runGenerate(
  changelog: ChangelogAPIType,
  { outFile, version }: CLIGenerateOptionsType
) {
  const markdown = changelog.generate({ version });

  if (outFile === '-') {
    process.stdout.write(markdown.endsWith('\n') ? markdown : `${markdown}\n`);

    return;
  }

  outputFileSync(outFile, markdown);
}
