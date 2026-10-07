import { outputFileSync } from '../../fileSystem.ts';
import type { ChangelogAPIType } from '../../types.ts';
import type { CLIGenerateOptionsType } from '../types.ts';

const INVALID_INPUT_EXIT_CODE = 2;

export default async function runGenerate(
  changelog: ChangelogAPIType,
  { outFile, version }: CLIGenerateOptionsType
) {
  let markdown: string;

  try {
    markdown = changelog.generate({ version });
  } catch (error) {
    // Configuration problems (unknown --version, missing legacy changelog) are not crashes
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = INVALID_INPUT_EXIT_CODE;

    return;
  }

  if (outFile === '-') {
    process.stdout.write(markdown.endsWith('\n') ? markdown : `${markdown}\n`);

    return;
  }

  outputFileSync(outFile, markdown);
}
