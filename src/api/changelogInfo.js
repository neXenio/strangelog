// @flow

import { join as joinPath } from 'path';

import { outputFileSync, existsSync, readFileSync } from 'fs-extra';
import jsYaml from 'js-yaml';

import type { ChangelogInfoType, ConfigType } from '../types';

export function getChangelogInfo(config: ConfigType): ChangelogInfoType {
  const infoFilePath = joinPath(config.path, 'info.yml');

  return existsSync(infoFilePath)
    ? jsYaml.safeLoad(readFileSync(infoFilePath))
    : { version: -1 };
}

export function saveChangelogInfo(
  config: ConfigType,
  newChangelogInfo: ChangelogInfoType
): void {
  const infoFilePath = joinPath(config.path, 'info.yml');

  return outputFileSync(
    infoFilePath,
    jsYaml.safeDump(newChangelogInfo)
  );
}
