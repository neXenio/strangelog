import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';

import { load } from 'js-yaml';

import type { ConfigType } from './types.ts';

export default function getProjectConfig(): ConfigType {
  const configFilePath = resolve('./.strangelogrc');
  const config = existsSync(configFilePath)
    ? (load(readFileSync(configFilePath).toString()) as Partial<ConfigType> | null)
    : {};

  return {
    path: './changelog',
    components: {},
    ...config
  };
}
