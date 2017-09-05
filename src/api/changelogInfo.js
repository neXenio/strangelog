// @flow

import { join as joinPath } from 'path';

import { sync as globSync } from 'glob';
import { outputFileSync, existsSync, readFileSync } from 'fs-extra';
import jsYaml from 'js-yaml';

import type { ChangelogInfoType, ConfigType } from '../types';

import { CURRENT_VERSION } from './migrations';

export function getChangelogInfo(config: ConfigType): ChangelogInfoType {
  ensureInitializedProject(config);

  return jsYaml.safeLoad(readFileSync(getInfoFilePath(config)));
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

function ensureInitializedProject(config) {
  const hasEntries = globSync(joinPath(config.path, '**/*')).length > 0;


  if (existsSync(getInfoFilePath(config))) {
    return;
  }

  saveChangelogInfo(config, {
    version: hasEntries ? -1 : CURRENT_VERSION
  });
}

function getInfoFilePath(config) {
  return joinPath(config.path, 'info.yml');
}