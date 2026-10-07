// @flow

import { resolve } from 'path';

import { load } from 'js-yaml';
import { existsSync, readFileSync } from 'fs-extra';

import type { ConfigType } from './types';

export default function getProjectConfig(): ConfigType {
  const configFilePath = resolve('./.strangelogrc');
  const config = existsSync(configFilePath)
    ? load(readFileSync(configFilePath).toString())
    : {};

  return {
    path: './changelog',
    components: {},
    ...config
  };
}