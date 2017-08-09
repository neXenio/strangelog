// @flow

import { resolve } from 'path';

import jsYaml from 'js-yaml';
import { existsSync, readFileSync } from 'fs-extra';

import type { ConfigType } from './types';

export default function getProjectConfig(): ConfigType {
  const configFilePath = resolve('./.strangelogrc');
  const config = existsSync(configFilePath)
    ? jsYaml.safeLoad(readFileSync(configFilePath).toString())
    : {};

  return {
    path: './changelog',
    components: {},
    ...config
  };
}