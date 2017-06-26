// @flow

import { outputFileSync } from 'fs-extra';

import { type ChangelogAPIType } from '../../types';
import { type CLIGenerateOptionsType } from '../types';

export default async function runGenerate(
  changelog: ChangelogAPIType,
  { outFile }: CLIGenerateOptionsType
) {
  const markdown = changelog.generate();

  outputFileSync(outFile, markdown);
}
