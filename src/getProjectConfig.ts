import { resolve } from 'path';

import { existsSync, readFileSync } from 'fs-extra';
import { load } from 'js-yaml';

import type { ConfigType } from './types';

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
